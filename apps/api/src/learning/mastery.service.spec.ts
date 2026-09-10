import { NotFoundException } from '@nestjs/common';
import { PARAMETERS } from '@app/learning-engine';
import { DomainEvents, type MasteryUpdated } from '../events/domain-events';
import { MasteryService } from './mastery.service';
import type { MasteryChangeEntity, SkillMasteryEntity } from './learning.entities';

const USER = '00000000-0000-4000-8000-000000000001';
const NOW = new Date('2026-09-10T10:00:00Z');

function masteryRepo(seed: Partial<SkillMasteryEntity>[] = []) {
  const rows = new Map<string, SkillMasteryEntity>();
  for (const row of seed) {
    rows.set(`${row.userId}:${row.skillId}`, {
      masteryScore: 0,
      confidenceScore: 0,
      successCount: 0,
      failureCount: 0,
      reviewCount: 0,
      intervalDays: 0,
      lastAttemptAt: null,
      lastReviewedAt: null,
      nextReviewAt: null,
      updatedAt: NOW,
      ...row,
    } as SkillMasteryEntity);
  }

  return {
    rows,
    find: jest.fn(async ({ where }: { where: { userId: string } }) =>
      [...rows.values()].filter((row) => row.userId === where.userId),
    ),
    findOne: jest.fn(async ({ where }: { where: { userId: string; skillId: string } }) =>
      rows.get(`${where.userId}:${where.skillId}`) ?? null,
    ),
    upsert: jest.fn(async (row: SkillMasteryEntity) => {
      rows.set(`${row.userId}:${row.skillId}`, { ...rows.get(`${row.userId}:${row.skillId}`), ...row });
    }),
  };
}

function changeRepo() {
  const inserted: Partial<MasteryChangeEntity>[] = [];
  return {
    inserted,
    insert: jest.fn(async (row: Partial<MasteryChangeEntity>) => {
      inserted.push(row);
    }),
  };
}

function build(seed: Partial<SkillMasteryEntity>[] = []) {
  const mastery = masteryRepo(seed);
  const changes = changeRepo();
  const events = new DomainEvents();
  const service = new MasteryService(events, mastery as never, changes as never);
  return { service, mastery, changes, events };
}

function attempt(overrides: Record<string, unknown> = {}) {
  return {
    userId: USER,
    attemptId: 'attempt-1',
    quizId: 'javascript-variables-quiz',
    chapterId: 'javascript-variables',
    source: 'CHAPTER',
    scorePercent: 100,
    passed: true,
    skillOutcomes: [{ skillId: 'variables', correct: 4, incorrect: 0 }],
    occurredAt: NOW,
    ...overrides,
  } as never;
}

/* -------------------------------------------------------------------------- */
/* Reacting to a graded attempt                                                */
/* -------------------------------------------------------------------------- */

describe('MasteryService.onAttemptGraded', () => {
  it('raises mastery on a passed attempt and schedules the next review', async () => {
    const { service, mastery } = build();
    await service.onAttemptGraded(attempt());

    const row = mastery.rows.get(`${USER}:variables`)!;
    expect(row.masteryScore).toBeGreaterThan(0);
    expect(row.successCount).toBe(4);
    expect(row.failureCount).toBe(0);
    expect(row.reviewCount).toBe(1);
    expect(row.nextReviewAt).not.toBeNull();
  });

  it('lowers mastery on a failed attempt', async () => {
    const { service, mastery } = build([{ userId: USER, skillId: 'variables', masteryScore: 70 }]);
    await service.onAttemptGraded(
      attempt({ passed: false, skillOutcomes: [{ skillId: 'variables', correct: 0, incorrect: 4 }] }),
    );

    expect(mastery.rows.get(`${USER}:variables`)!.masteryScore).toBeLessThan(70);
  });

  it('accumulates counts across attempts rather than replacing them', async () => {
    const { service, mastery } = build([
      { userId: USER, skillId: 'variables', successCount: 3, failureCount: 1, reviewCount: 2 },
    ]);
    await service.onAttemptGraded(
      attempt({ skillOutcomes: [{ skillId: 'variables', correct: 2, incorrect: 1 }] }),
    );

    const row = mastery.rows.get(`${USER}:variables`)!;
    expect(row.successCount).toBe(5);
    expect(row.failureCount).toBe(2);
    expect(row.reviewCount).toBe(3);
  });

  it('stores the engine reason, so the move stays explainable', async () => {
    const { service, changes } = build();
    await service.onAttemptGraded(attempt());

    expect(changes.inserted).toHaveLength(1);
    expect(changes.inserted[0]).toMatchObject({
      skillId: 'variables',
      sourceType: 'QUIZ_ATTEMPT',
      sourceId: 'attempt-1',
    });
    expect(String(changes.inserted[0]!.reason).length).toBeGreaterThan(10);
  });

  it('emits mastery.updated with the before and after', async () => {
    const { service, events } = build();
    const seen: MasteryUpdated[] = [];
    events.on('mastery.updated', (payload) => {
      seen.push(payload);
    });

    await service.onAttemptGraded(attempt());

    expect(seen).toHaveLength(1);
    expect(seen[0]!.changes[0]).toMatchObject({ skillId: 'variables', from: 0 });
    expect(seen[0]!.changes[0]!.to).toBeGreaterThan(0);
  });

  it('emits nothing when the attempt touched no skill', async () => {
    const { service, events } = build();
    let count = 0;
    events.on('mastery.updated', () => {
      count += 1;
    });

    await service.onAttemptGraded(attempt({ skillOutcomes: [] }));
    expect(count).toBe(0);
  });

  it('handles several skills in one attempt', async () => {
    const { service, mastery } = build();
    await service.onAttemptGraded(
      attempt({
        skillOutcomes: [
          { skillId: 'variables', correct: 2, incorrect: 0 },
          { skillId: 'scope', correct: 0, incorrect: 2 },
        ],
      }),
    );

    expect(mastery.rows.get(`${USER}:variables`)!.masteryScore).toBeGreaterThan(0);
    expect(mastery.rows.has(`${USER}:scope`)).toBe(true);
  });

  it('keeps every score inside 0..100', async () => {
    const { service, mastery } = build([{ userId: USER, skillId: 'variables', masteryScore: 100 }]);
    await service.onAttemptGraded(attempt());

    const row = mastery.rows.get(`${USER}:variables`)!;
    expect(row.masteryScore).toBeLessThanOrEqual(100);
    expect(row.masteryScore).toBeGreaterThanOrEqual(0);
  });
});

/* -------------------------------------------------------------------------- */
/* Reacting to a completed chapter                                             */
/* -------------------------------------------------------------------------- */

describe('MasteryService.onChapterCompleted', () => {
  const completion = {
    userId: USER,
    chapterId: 'javascript-variables',
    technologySlug: 'javascript',
    skillIds: ['variables'],
    xp: 60,
    occurredAt: NOW,
  } as never;

  it('moves mastery less than a graded attempt does', async () => {
    const read = build();
    await read.service.onChapterCompleted(completion);

    const quizzed = build();
    await quizzed.service.onAttemptGraded(attempt());

    // Reading is evidence; answering questions about it is better evidence.
    expect(read.mastery.rows.get(`${USER}:variables`)!.masteryScore).toBeLessThan(
      quizzed.mastery.rows.get(`${USER}:variables`)!.masteryScore,
    );
  });

  it('does not count as a review', async () => {
    const { service, mastery } = build();
    await service.onChapterCompleted(completion);
    expect(mastery.rows.get(`${USER}:variables`)!.reviewCount).toBe(0);
  });

  it('records the completion as the source of the change', async () => {
    const { service, changes } = build();
    await service.onChapterCompleted(completion);
    expect(changes.inserted[0]).toMatchObject({
      sourceType: 'CHAPTER_COMPLETION',
      sourceId: 'javascript-variables',
    });
  });
});

/* -------------------------------------------------------------------------- */
/* Scheduling                                                                  */
/* -------------------------------------------------------------------------- */

describe('review scheduling', () => {
  it('always leaves a weak skill scheduled', async () => {
    const { service, mastery } = build();
    await service.onAttemptGraded(
      attempt({ passed: false, skillOutcomes: [{ skillId: 'variables', correct: 0, incorrect: 3 }] }),
    );

    const row = mastery.rows.get(`${USER}:variables`)!;
    expect(row.masteryScore).toBeLessThan(PARAMETERS.mastery.masteredThreshold);
    // Nothing weak is left unplanned.
    expect(row.nextReviewAt).not.toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/* Reads                                                                       */
/* -------------------------------------------------------------------------- */

describe('reads', () => {
  it('reports every skill of a technology, zero for those never touched', async () => {
    const { service } = build([{ userId: USER, skillId: 'closures', masteryScore: 72 }]);
    const view = await service.byTechnology(USER, 'javascript', NOW);

    expect(view.skills.length).toBeGreaterThan(1);
    expect(view.skills.find((skill) => skill.skillId === 'closures')!.mastery).toBe(72);
    expect(view.skills.find((skill) => skill.skillId === 'scope')!.mastery).toBe(0);
  });

  it('404s on an unknown technology', async () => {
    const { service } = build();
    await expect(service.byTechnology(USER, 'ruby', NOW)).rejects.toThrow(NotFoundException);
  });

  it('never mixes learners', async () => {
    const { service } = build([{ userId: 'autre', skillId: 'closures', masteryScore: 99 }]);
    const view = await service.byTechnology(USER, 'javascript', NOW);
    expect(view.skills.find((skill) => skill.skillId === 'closures')!.mastery).toBe(0);
  });

  it('orders weak skills by priority and explains each one', async () => {
    const { service } = build([
      { userId: USER, skillId: 'closures', masteryScore: 10, lastReviewedAt: new Date('2026-08-01') },
      { userId: USER, skillId: 'scope', masteryScore: 55, lastReviewedAt: NOW },
    ]);
    const weak = await service.weakSkills(USER, 3, NOW);

    expect(weak.length).toBeGreaterThan(0);
    expect(weak[0]!.reason.length).toBeGreaterThan(10);
    expect(weak[0]!.estimatedMinutes).toBeGreaterThan(0);
    for (let i = 1; i < weak.length; i += 1) {
      expect(weak[i - 1]!.priority).toBeGreaterThanOrEqual(weak[i]!.priority);
    }
  });

  it('honours the limit', async () => {
    const { service } = build();
    expect(await service.weakSkills(USER, 1, NOW)).toHaveLength(1);
  });

  it('lists only skills whose review date has passed', async () => {
    const past = new Date(NOW.getTime() - 86_400_000);
    const future = new Date(NOW.getTime() + 86_400_000);
    const { service } = build([
      { userId: USER, skillId: 'closures', masteryScore: 40, nextReviewAt: past },
      { userId: USER, skillId: 'scope', masteryScore: 40, nextReviewAt: future },
    ]);

    const due = await service.dueReviews(USER, NOW);
    expect(due.map((item) => item.skillId)).toEqual(['closures']);
  });

  it('returns nothing due for a learner with no rows', async () => {
    const { service } = build();
    expect(await service.dueReviews(USER, NOW)).toEqual([]);
  });
});
