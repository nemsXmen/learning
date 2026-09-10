import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PARAMETERS } from '@app/learning-engine';
import { bundledGraph } from '@app/content';
import { DomainEvents } from '../events/domain-events';
import { BoostService } from './boost.service';
import type { BoostSessionEntity } from './boost.entities';

const USER = '00000000-0000-4000-8000-000000000001';
const NOW = new Date('2026-09-10T10:00:00Z');

function sessionRepo() {
  const rows = new Map<string, BoostSessionEntity>();
  let next = 0;

  return {
    rows,
    create: (value: Partial<BoostSessionEntity>) => value as BoostSessionEntity,
    save: jest.fn(async (value: BoostSessionEntity) => {
      const id = value.id ?? `00000000-0000-4000-8000-00000000000${(next += 1)}`;
      const row = { ...value, id, createdAt: NOW, answers: value.answers ?? [] } as BoostSessionEntity;
      rows.set(id, row);
      return row;
    }),
    findOne: jest.fn(async ({ where }: { where: { id: string } }) => rows.get(where.id) ?? null),
    update: jest.fn(async ({ id }: { id: string }, patch: Partial<BoostSessionEntity>) => {
      const row = rows.get(id);
      if (row) rows.set(id, { ...row, ...patch } as BoostSessionEntity);
    }),
  };
}

/** Weak everywhere, so the engine always has something to plan. */
function masteryStub(scores: Record<string, number> = {}) {
  const snapshots = bundledGraph.skills.map((skill) => ({
    skillId: skill.id,
    masteryScore: scores[skill.id] ?? 0,
    confidenceScore: 0,
    successCount: 0,
    failureCount: 0,
    difficulty: 3 as const,
    importance: skill.importance as 1 | 2 | 3 | 4 | 5,
    lastAttemptAt: null,
    lastReviewedAt: null,
    nextReviewAt: null,
    reviewCount: 0,
    intervalDays: 0,
  }));

  return {
    snapshotsFor: jest.fn(async () => snapshots),
    scoresFor: jest.fn(async () => new Map(Object.entries(scores))),
    weakSkills: jest.fn(async (_u: string, limit = 3) =>
      snapshots
        .filter((snapshot) => snapshot.masteryScore < PARAMETERS.mastery.weakThreshold)
        .slice(0, limit)
        .map((snapshot) => ({
          skillId: snapshot.skillId,
          name: snapshot.skillId,
          mastery: snapshot.masteryScore,
          confidence: 0,
          nextReviewAt: null,
          dueNow: false,
          band: 'high' as const,
          priority: 0.8,
          reason: 'Ton score est de 0 %.',
          estimatedMinutes: 4,
        })),
    ),
  };
}

function build(options: { scores?: Record<string, number>; weakOverride?: unknown[] } = {}) {
  const sessions = sessionRepo();
  const mastery = masteryStub(options.scores);
  if (options.weakOverride) {
    mastery.weakSkills = (async () => options.weakOverride) as never;
  }
  const xp = { award: jest.fn(async () => PARAMETERS.xp.BOOST_COMPLETED) };
  const events = new DomainEvents();

  const service = new BoostService(mastery as never, xp as never, events, sessions as never);
  return { service, sessions, mastery, xp, events };
}

/* -------------------------------------------------------------------------- */
/* Preview                                                                     */
/* -------------------------------------------------------------------------- */

describe('BoostService.preview', () => {
  it('offers a session with the skills that need it, each explained', async () => {
    const { service } = build();
    const preview = await service.preview(USER, NOW);

    expect(preview.available).toBe(true);
    expect(preview.targetSkills.length).toBeGreaterThan(0);
    expect(preview.targetSkills[0]!.reason.length).toBeGreaterThan(5);
    expect(preview.suggestedMinutes).toBeGreaterThanOrEqual(PARAMETERS.boost.minMinutes);
    expect(preview.suggestedMinutes).toBeLessThanOrEqual(PARAMETERS.boost.maxMinutes);
  });

  it('says so plainly when nothing needs reinforcing, rather than failing', async () => {
    const { service } = build({ weakOverride: [] });
    const preview = await service.preview(USER, NOW);

    // CDC §81: an empty state still has to say something.
    expect(preview.available).toBe(false);
    expect(preview.reason).toMatch(/rien à renforcer/i);
    expect(preview.targetSkills).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* Creating                                                                    */
/* -------------------------------------------------------------------------- */

describe('BoostService.create', () => {
  it('builds a plan that fits the chosen budget', async () => {
    const { service } = build();
    for (const minutes of [5, 10, 15]) {
      const session = await service.create(USER, minutes, NOW);
      expect(session.estimatedMinutes).toBeLessThanOrEqual(minutes);
      expect(session.steps.length).toBeGreaterThan(0);
    }
  });

  it('refuses a duration outside the offered ones', async () => {
    const { service } = build();
    await expect(service.create(USER, 7, NOW)).rejects.toThrow(BadRequestException);
    await expect(service.create(USER, 7, NOW)).rejects.toMatchObject({
      response: { code: 'INVALID_DURATION' },
    });
  });

  it('stores the plan so the session survives a reload', async () => {
    const { service, sessions } = build();
    const session = await service.create(USER, 10, NOW);

    const stored = sessions.rows.get(session.sessionId)!;
    expect(stored.plan.steps).toHaveLength(session.steps.length);
    expect(stored.status).toBe('IN_PROGRESS');
  });

  it('serves questions without their answer key', async () => {
    const { service } = build();
    const session = await service.create(USER, 15, NOW);

    const serialized = JSON.stringify(session);
    expect(serialized).not.toContain('explanation');
    expect(session.steps.every((step) => !step.question || !('answer' in step.question))).toBe(true);
  });

  it('carries the engine reason for targeting these skills', async () => {
    const { service } = build();
    expect((await service.create(USER, 10, NOW)).reason.length).toBeGreaterThan(10);
  });
});

/* -------------------------------------------------------------------------- */
/* Running                                                                     */
/* -------------------------------------------------------------------------- */

describe('BoostService.answerStep', () => {
  async function started() {
    const context = build();
    const session = await context.service.create(USER, 15, NOW);
    return { ...context, session };
  }

  it('grades a step and returns the explanation once answered', async () => {
    const { service, session } = await started();
    const result = await service.answerStep(USER, session.sessionId, 0, [0]);

    expect(result.index).toBe(0);
    expect(typeof result.isCorrect).toBe('boolean');
    if (session.steps[0]!.question) expect(result.explanation).toBeTruthy();
  });

  it('refuses a step out of order', async () => {
    const { service, session } = await started();
    await expect(service.answerStep(USER, session.sessionId, 2, [0])).rejects.toMatchObject({
      response: { code: 'STEP_OUT_OF_ORDER' },
    });
  });

  it('advances the current step, so a reload resumes where it stopped', async () => {
    const { service, session } = await started();
    await service.answerStep(USER, session.sessionId, 0, [0]);

    expect((await service.get(USER, session.sessionId)).currentStepIndex).toBe(1);
  });

  it('reports the next step, and null on the last one', async () => {
    const { service, session } = await started();
    const first = await service.answerStep(USER, session.sessionId, 0, [0]);
    expect(first.nextStepIndex).toBe(1);

    for (let index = 1; index < session.steps.length; index += 1) {
      const result = await service.answerStep(USER, session.sessionId, index, [0]);
      if (index === session.steps.length - 1) expect(result.nextStepIndex).toBeNull();
    }
  });

  it("reads another learner's session as absent", async () => {
    const { service, session } = await started();
    await expect(service.answerStep('autre', session.sessionId, 0, [0])).rejects.toThrow(
      NotFoundException,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Completing                                                                  */
/* -------------------------------------------------------------------------- */

describe('BoostService.complete', () => {
  async function ran(answer: number[] = [0]) {
    const context = build();
    const session = await context.service.create(USER, 15, NOW);
    for (let index = 0; index < session.steps.length; index += 1) {
      await context.service.answerStep(USER, session.sessionId, index, answer);
    }
    return { ...context, session };
  }

  it('scores the session and reports a delta per target skill', async () => {
    const { service, session } = await ran();
    const result = await service.complete(USER, session.sessionId, NOW);

    expect(result.scorePercent).toBeGreaterThanOrEqual(0);
    expect(result.scorePercent).toBeLessThanOrEqual(100);
    expect(result.masteryDeltas.map((delta) => delta.skillId)).toEqual(session.targetSkillIds);
  });

  it('emits a graded attempt so mastery and XP react as they do for a quiz', async () => {
    const { service, events } = build();
    const created = await service.create(USER, 15, NOW);
    const seen: unknown[] = [];
    events.on('quiz.attempt.graded', (payload) => {
      seen.push(payload);
    });

    for (let index = 0; index < created.steps.length; index += 1) {
      await service.answerStep(USER, created.sessionId, index, [0]);
    }
    await service.complete(USER, created.sessionId, NOW);

    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ source: 'BOOST' });
  });

  it('awards the boost XP once', async () => {
    const { service, session, xp } = await ran();
    const first = await service.complete(USER, session.sessionId, NOW);
    expect(first.xpAwarded).toBe(PARAMETERS.xp.BOOST_COMPLETED);

    const second = await service.complete(USER, session.sessionId, NOW);
    // A completed session is read back, not graded again.
    expect(second.xpAwarded).toBe(0);
    expect(xp.award).toHaveBeenCalledTimes(1);
  });

  it('marks the session completed and keeps its score', async () => {
    const { service, session, sessions } = await ran();
    const result = await service.complete(USER, session.sessionId, NOW);

    const stored = sessions.rows.get(session.sessionId)!;
    expect(stored.status).toBe('COMPLETED');
    expect(stored.scorePercent).toBe(result.scorePercent);
    expect(stored.completedAt).not.toBeNull();
  });

  it('refuses to answer a step once the session is closed', async () => {
    const { service, session } = await ran();
    await service.complete(USER, session.sessionId, NOW);

    await expect(service.answerStep(USER, session.sessionId, 0, [0])).rejects.toThrow(
      ConflictException,
    );
  });
});
