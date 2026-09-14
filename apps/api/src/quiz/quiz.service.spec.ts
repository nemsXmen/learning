import { ConflictException, GoneException, NotFoundException } from '@nestjs/common';
import { DomainEvents, type QuizAttemptGraded } from '../events/domain-events';
import { ChapterAccessService } from '../learning/chapter-access.service';
import { ATTEMPT_TTL_MS, QuizService } from './quiz.service';
import type { QuizAttemptEntity } from './quiz.entities';

const USER = '00000000-0000-4000-8000-000000000001';
const QUIZ_ID = 'javascript-variables-quiz';

function attemptRepo(seed: Partial<QuizAttemptEntity>[] = []) {
  const rows = new Map<string, QuizAttemptEntity>();
  let next = 0;

  for (const row of seed) {
    const id = row.id ?? `attempt-${(next += 1)}`;
    rows.set(id, {
      id,
      userId: USER,
      quizId: QUIZ_ID,
      contentVersion: 'aaaaaaaaaaaa',
      source: 'CHAPTER',
      startedAt: new Date(),
      submittedAt: null,
      scorePercent: null,
      passed: null,
      ...row,
    } as QuizAttemptEntity);
  }

  return {
    rows,
    create: (value: Partial<QuizAttemptEntity>) => value as QuizAttemptEntity,
    save: jest.fn(async (value: QuizAttemptEntity) => {
      const id = value.id ?? `attempt-${(next += 1)}`;
      const row = { ...value, id, startedAt: value.startedAt ?? new Date() } as QuizAttemptEntity;
      rows.set(id, row);
      return row;
    }),
    findOne: jest.fn(async ({ where }: { where: { id: string } }) => rows.get(where.id) ?? null),
    find: jest.fn(async () => [...rows.values()]),
    createQueryBuilder: () => {
      let patch: Partial<QuizAttemptEntity> = {};
      let id = '';
      const builder = {
        update: () => builder,
        set: (value: Partial<QuizAttemptEntity>) => {
          patch = value;
          return builder;
        },
        where: (_sql: string, params: { id: string }) => {
          id = params.id;
          return builder;
        },
        // Mirrors `WHERE submitted_at IS NULL`, the guard against double grading.
        execute: async () => {
          const row = rows.get(id);
          if (!row || row.submittedAt !== null) return { affected: 0 };
          rows.set(id, { ...row, ...patch } as QuizAttemptEntity);
          return { affected: 1 };
        },
      };
      return builder;
    },
  };
}

function answerRepo() {
  const saved: unknown[] = [];
  return {
    saved,
    create: (value: unknown) => value,
    save: jest.fn(async (rows: unknown[]) => {
      saved.push(...rows);
      return rows;
    }),
  };
}

function build(seed: Partial<QuizAttemptEntity>[] = []) {
  const attempts = attemptRepo(seed);
  const answers = answerRepo();
  const events = new DomainEvents();
  // Nothing is mastered, but the seed chapter has no prerequisites.
  const access = new ChapterAccessService({ find: async () => [] } as never);

  const service = new QuizService(access, events, attempts as never, answers as never);
  return { service, attempts, answers, events };
}

/* -------------------------------------------------------------------------- */
/* Starting                                                                    */
/* -------------------------------------------------------------------------- */

describe('QuizService.start', () => {
  it('serves the questions with no answer key', async () => {
    const { service } = build();
    const started = await service.start(USER, QUIZ_ID);

    expect(started.questions.length).toBeGreaterThan(0);
    const serialized = JSON.stringify(started);
    expect(serialized).not.toContain('explanation');
    expect(started.questions.every((question) => !('answer' in question))).toBe(true);
  });

  it('stamps the content version the learner is about to see', async () => {
    const { service } = build();
    const started = await service.start(USER, QUIZ_ID);
    expect(started.contentVersion).toMatch(/^[0-9a-f]{12}$/);
  });

  it('404s on an unknown quiz', async () => {
    const { service } = build();
    await expect(service.start(USER, 'quiz-fantome')).rejects.toThrow(NotFoundException);
  });

  it('refuses a quiz whose chapter is locked', async () => {
    const { service } = build();
    // The closures chapter needs the `functions` skill, mastered nowhere here.
    await expect(service.start(USER, 'javascript-closures-quiz')).rejects.toMatchObject({
      response: { code: 'CHAPTER_LOCKED' },
    });
  });
});

/* -------------------------------------------------------------------------- */
/* Submitting                                                                  */
/* -------------------------------------------------------------------------- */

describe('QuizService.submit', () => {
  async function startedAttempt() {
    const context = build();
    const started = await context.service.start(USER, QUIZ_ID);
    return { ...context, started };
  }

  it('grades, stores the answers and returns the feedback', async () => {
    const { service, started, answers } = await startedAttempt();
    const first = started.questions[0]!;

    const result = await service.submit(USER, started.attemptId, [
      { questionId: first.id, given: [1], timeSpentMs: 4200 },
    ]);

    expect(result.attemptId).toBe(started.attemptId);
    expect(result.results.length).toBe(started.questions.length);
    expect(answers.saved.length).toBe(started.questions.length);

    const graded = result.results.find((item) => item.questionId === first.id)!;
    expect(graded.explanation).toBeTruthy();
    expect(graded.correct).toBeDefined();
  });

  it('returns the best score before this attempt, the same one XP decided from', async () => {
    const { service, started, events } = await startedAttempt();
    const seen: QuizAttemptGraded[] = [];
    events.on('quiz.attempt.graded', (payload) => {
      seen.push(payload);
    });

    const result = await service.submit(USER, started.attemptId, [
      { questionId: started.questions[0]!.id, given: [0] },
    ]);

    // Never passed before: nothing to compare against.
    expect(result.previousBestScore).toBeNull();
    expect(result.previousBestScore).toBe(seen[0]!.previousBestScore);
  });

  it('records the time spent per question', async () => {
    const { service, started, answers } = await startedAttempt();
    await service.submit(USER, started.attemptId, [
      { questionId: started.questions[0]!.id, given: [0], timeSpentMs: 1234 },
    ]);
    expect(answers.saved).toContainEqual(expect.objectContaining({ timeSpentMs: 1234 }));
  });

  it('emits quiz.attempt.graded once, with the per-skill tally', async () => {
    const { service, started, events } = await startedAttempt();
    const seen: QuizAttemptGraded[] = [];
    events.on('quiz.attempt.graded', (payload) => {
      seen.push(payload);
    });

    await service.submit(USER, started.attemptId, [
      { questionId: started.questions[0]!.id, given: [0] },
    ]);

    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ userId: USER, quizId: QUIZ_ID, chapterId: 'javascript-variables' });
    expect(seen[0]!.skillOutcomes.length).toBeGreaterThan(0);
  });

  it('refuses a second submission', async () => {
    const { service, started } = await startedAttempt();
    await service.submit(USER, started.attemptId, []);
    await expect(service.submit(USER, started.attemptId, [])).rejects.toMatchObject({
      response: { code: 'ATTEMPT_ALREADY_SUBMITTED' },
    });
  });

  it('grades once under concurrent submissions', async () => {
    const { service, started, events } = await startedAttempt();
    let count = 0;
    events.on('quiz.attempt.graded', () => {
      count += 1;
    });

    const outcomes = await Promise.allSettled([
      service.submit(USER, started.attemptId, []),
      service.submit(USER, started.attemptId, []),
    ]);

    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1);
    expect(count).toBe(1);
  });

  it("reads another learner's attempt as absent rather than forbidden", async () => {
    const { service, started } = await startedAttempt();
    // A 403 would confirm the attempt exists.
    await expect(service.submit('un-autre', started.attemptId, [])).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects an answer to a question outside the quiz', async () => {
    const { service, started } = await startedAttempt();
    await expect(
      service.submit(USER, started.attemptId, [{ questionId: 'fantome', given: [0] }]),
    ).rejects.toMatchObject({ response: { code: 'INVALID_ANSWER' } });
  });

  it('expires a stale attempt', async () => {
    const { service } = build([
      { id: 'vieille', startedAt: new Date(Date.now() - ATTEMPT_TTL_MS - 1000) },
    ]);
    await expect(service.submit(USER, 'vieille', [])).rejects.toThrow(GoneException);
  });

  it('404s on an unknown attempt', async () => {
    const { service } = build();
    await expect(service.submit(USER, 'inexistante', [])).rejects.toThrow(NotFoundException);
  });

  it('grades an empty submission as all wrong rather than refusing it', async () => {
    const { service, started } = await startedAttempt();
    const result = await service.submit(USER, started.attemptId, []);

    expect(result.scorePercent).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.results.every((item) => !item.isCorrect)).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* History                                                                     */
/* -------------------------------------------------------------------------- */

describe('QuizService.history', () => {
  it('returns the attempts for that quiz', async () => {
    const { service, started } = await (async () => {
      const context = build();
      const attempt = await context.service.start(USER, QUIZ_ID);
      await context.service.submit(USER, attempt.attemptId, []);
      return { ...context, started: attempt };
    })();

    const history = await service.history(USER, QUIZ_ID);
    expect(history[0]).toMatchObject({ attemptId: started.attemptId, scorePercent: 0 });
  });
});

describe('QuizService.quizForChapter', () => {
  it('finds the quiz behind a chapter URL', () => {
    const { service } = build();
    expect(service.quizForChapter('javascript', 'variables').id).toBe(QUIZ_ID);
  });

  it('404s when the chapter or its quiz is unknown', () => {
    const { service } = build();
    expect(() => service.quizForChapter('javascript', 'inconnu')).toThrow(NotFoundException);
  });
});

describe('ConflictException mapping', () => {
  it('uses 409 for a resubmission', async () => {
    const { service } = build([{ id: 'faite', submittedAt: new Date() }]);
    await expect(service.submit(USER, 'faite', [])).rejects.toThrow(ConflictException);
  });
});
