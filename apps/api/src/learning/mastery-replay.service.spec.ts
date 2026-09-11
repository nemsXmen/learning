import { DomainEvents } from '../events/domain-events';
import { MasteryService } from './mastery.service';
import { MasteryReplayService } from './mastery-replay.service';
import type { MasteryChangeEntity, SkillMasteryEntity, UserProgressEntity } from './learning.entities';
import type { AttemptAnswerEntity, QuizAttemptEntity } from '../quiz/quiz.entities';
import type { BoostSessionEntity } from '../boost/boost.entities';

const USER = '00000000-0000-4000-8000-000000000001';

/**
 * A store shared by both services, so "what the live path wrote" and "what
 * replay rebuilds" are compared on the same ground.
 */
function store() {
  const mastery: SkillMasteryEntity[] = [];
  const changes: Array<Partial<MasteryChangeEntity>> = [];

  const masteryRepo = {
    rows: mastery,
    find: async ({ where }: { where: { userId: string } }) =>
      mastery.filter((row) => row.userId === where.userId),
    findOne: async ({ where }: { where: { userId: string; skillId: string } }) =>
      mastery.find((row) => row.userId === where.userId && row.skillId === where.skillId) ?? null,
    upsert: async (row: SkillMasteryEntity) => {
      const index = mastery.findIndex(
        (item) => item.userId === row.userId && item.skillId === row.skillId,
      );
      if (index >= 0) mastery[index] = { ...mastery[index], ...row } as SkillMasteryEntity;
      else mastery.push(row);
    },
    manager: {
      transaction: async (work: (tx: unknown) => Promise<void>) => {
        const tx = {
          // The real entity classes carry their own names; no mock needed.
          delete: async (entity: { name: string }, criteria: { userId: string }) => {
            const target = entity.name === 'SkillMasteryEntity' ? mastery : changes;
            for (let i = target.length - 1; i >= 0; i -= 1) {
              if ((target[i] as { userId?: string }).userId === criteria.userId) target.splice(i, 1);
            }
          },
          insert: async (entity: { name: string }, rows: unknown[]) => {
            if (entity.name === 'SkillMasteryEntity') mastery.push(...(rows as SkillMasteryEntity[]));
            else changes.push(...(rows as Array<Partial<MasteryChangeEntity>>));
          },
        };
        await work(tx);
      },
    },
  };

  const changeRepo = {
    rows: changes,
    insert: async (row: Partial<MasteryChangeEntity>) => {
      changes.push(row);
    },
  };

  return { mastery, changes, masteryRepo, changeRepo };
}

function historyRepos(options: {
  attempts?: Array<Partial<QuizAttemptEntity>>;
  answers?: Array<Partial<AttemptAnswerEntity>>;
  completions?: Array<Partial<UserProgressEntity>>;
  boosts?: Array<Partial<BoostSessionEntity>>;
}) {
  return {
    progress: {
      find: async () => (options.completions ?? []) as UserProgressEntity[],
    },
    attempts: {
      calls: [] as unknown[],
      find: async function (query?: unknown) {
        this.calls.push(query);
        return (options.attempts ?? []) as QuizAttemptEntity[];
      },
    },
    answers: {
      find: async () => (options.answers ?? []) as AttemptAnswerEntity[],
    },
    boosts: {
      find: async () => (options.boosts ?? []) as BoostSessionEntity[],
    },
  };
}

/** One construction site, so a new dependency lands in every test at once. */
function make(shared: ReturnType<typeof store>, history: ReturnType<typeof historyRepos>) {
  return new MasteryReplayService(
    shared.masteryRepo as never,
    shared.changeRepo as never,
    history.progress as never,
    history.attempts as never,
    history.answers as never,
    history.boosts as never,
  );
}

function comparable(rows: SkillMasteryEntity[]) {
  return rows
    .map((row) => ({
      skillId: row.skillId,
      masteryScore: Math.round(row.masteryScore * 1000) / 1000,
      confidenceScore: Math.round(row.confidenceScore * 1000) / 1000,
      successCount: row.successCount,
      failureCount: row.failureCount,
      reviewCount: row.reviewCount,
      intervalDays: row.intervalDays,
    }))
    .sort((a, b) => a.skillId.localeCompare(b.skillId));
}

/* -------------------------------------------------------------------------- */

describe('MasteryReplayService', () => {
  const T1 = new Date('2026-09-01T10:00:00Z');
  const T2 = new Date('2026-09-03T10:00:00Z');
  const T3 = new Date('2026-09-05T10:00:00Z');

  const attempts = [
    { id: 'a1', userId: USER, quizId: 'q', submittedAt: T2, passed: true, scorePercent: 100 },
    { id: 'a2', userId: USER, quizId: 'q', submittedAt: T3, passed: false, scorePercent: 25 },
  ];
  const answers = [
    { attemptId: 'a1', questionId: 'js-variables-q1', isCorrect: true },
    { attemptId: 'a1', questionId: 'js-variables-q2', isCorrect: true },
    { attemptId: 'a2', questionId: 'js-variables-q1', isCorrect: false },
    { attemptId: 'a2', questionId: 'js-variables-q2', isCorrect: false },
  ];
  const completions = [
    { userId: USER, chapterId: 'javascript-variables', status: 'COMPLETED' as const, completedAt: T1 },
  ];

  function buildReplay(shared: ReturnType<typeof store>) {
    return make(shared, historyRepos({ attempts, answers, completions }));
  }

  it('rebuilds mastery from the history', async () => {
    const shared = store();
    const report = await buildReplay(shared).replay(USER);

    expect(report.events).toBe(3);
    expect(report.attempts).toBe(2);
    expect(report.completions).toBe(1);
    expect(shared.mastery.length).toBeGreaterThan(0);
    expect(shared.mastery[0]!.skillId).toBe('variables');
  });

  it('asks the database for submitted attempts with a predicate SQL can satisfy', async () => {
    // This one is defensive rather than behavioural, and it exists because of a
    // real incident: `Not(In([null]))` compiles to `NOT IN (NULL)`, which is NULL
    // — never true — so the replay found zero attempts and quietly rebuilt every
    // learner from their chapter completions alone. A mock repository cannot
    // reproduce SQL's three-valued logic, so the only thing a unit test can
    // defend is the shape of the query itself.
    const shared = store();
    const history = historyRepos({ attempts, answers, completions });
    await make(shared, history).replay(USER);

    const where = (history.attempts.calls[0] as { where: Record<string, unknown> }).where;
    const submittedAt = where.submittedAt as { type: string; child?: { type: string } };
    expect(submittedAt.type).toBe('not');
    // Negated IS NULL, never a comparison of a value against a list holding null.
    expect(submittedAt.child?.type).toBe('isNull');
  });

  it('is idempotent: replaying twice leaves the same state', async () => {
    const shared = store();
    const replay = buildReplay(shared);

    await replay.replay(USER);
    const first = comparable(shared.mastery);

    await replay.replay(USER);
    expect(comparable(shared.mastery)).toEqual(first);
  });

  it('does not accumulate audit rows across runs', async () => {
    const shared = store();
    const replay = buildReplay(shared);

    await replay.replay(USER);
    const after = shared.changes.length;

    await replay.replay(USER);
    expect(shared.changes.length).toBe(after);
  });

  it('reproduces exactly what the live path produced', async () => {
    // This is the property the whole design leans on: the attempt is the fact,
    // mastery is derived, so folding the history again has to land in the same
    // place (features/10-skill-mastery-and-review/CONTRACT.md).
    const live = store();
    const service = new MasteryService(
      new DomainEvents(),
      live.masteryRepo as never,
      live.changeRepo as never,
    );

    await service.onChapterCompleted({
      userId: USER,
      chapterId: 'javascript-variables',
      technologySlug: 'javascript',
      skillIds: ['variables'],
      xp: 60,
      occurredAt: T1,
    });
    await service.onAttemptGraded({
      userId: USER,
      attemptId: 'a1',
      quizId: 'q',
      chapterId: 'javascript-variables',
      source: 'CHAPTER',
      scorePercent: 100,
      passed: true,
      previousBestScore: null,
      skillOutcomes: [{ skillId: 'variables', correct: 2, incorrect: 0 }],
      occurredAt: T2,
    });
    await service.onAttemptGraded({
      userId: USER,
      attemptId: 'a2',
      quizId: 'q',
      chapterId: 'javascript-variables',
      source: 'CHAPTER',
      scorePercent: 25,
      passed: false,
      previousBestScore: 100,
      skillOutcomes: [{ skillId: 'variables', correct: 0, incorrect: 2 }],
      occurredAt: T3,
    });

    const expected = comparable(live.mastery);

    const rebuilt = store();
    await buildReplay(rebuilt).replay(USER);

    expect(comparable(rebuilt.mastery)).toEqual(expected);
  });

  it('replays a Boost session, because it moves mastery like an attempt', async () => {
    // A Boost session is graded from its own stored plan and answers, never from
    // a quiz_attempt row. Reading only quiz_attempt made replay rebuild learners
    // as if their revision sessions had never happened.
    const plan = {
      targetSkillIds: ['variables'],
      estimatedMinutes: 5,
      reason: 'test',
      steps: [
        { index: 0, kind: 'QUESTION' as const, ref: 'js-variables-q1', skillId: 'variables', estimatedMinutes: 1 },
        { index: 1, kind: 'EXPLANATION' as const, ref: null, skillId: 'variables', estimatedMinutes: 2 },
        { index: 2, kind: 'QUESTION' as const, ref: 'js-variables-q2', skillId: 'variables', estimatedMinutes: 1 },
      ],
    };
    const boostAnswers = [
      { index: 0, correct: true },
      { index: 1, correct: true },
      { index: 2, correct: false },
    ];
    const session = {
      id: 'b1',
      userId: USER,
      status: 'COMPLETED' as const,
      completedAt: T2,
      plan,
      answers: boostAnswers,
    };

    const live = store();
    await new MasteryService(new DomainEvents(), live.masteryRepo as never, live.changeRepo as never)
      .onAttemptGraded({
        userId: USER,
        attemptId: 'boost:b1',
        quizId: 'boost:b1',
        chapterId: '',
        source: 'BOOST',
        scorePercent: 50,
        passed: false,
        previousBestScore: null,
        // The graded steps only: one right, one wrong; the explanation counts for nothing.
        skillOutcomes: [{ skillId: 'variables', correct: 1, incorrect: 1 }],
        occurredAt: T2,
      });

    const rebuilt = store();
    const report = await make(rebuilt, historyRepos({ boosts: [session] })).replay(USER);

    expect(report.attempts).toBe(1);
    expect(comparable(rebuilt.mastery)).toEqual(comparable(live.mastery));
    // And the audit row points at the same source the live path recorded.
    expect(rebuilt.changes[0]).toMatchObject({ sourceType: 'QUIZ_ATTEMPT', sourceId: 'boost:b1' });
  });

  it('reports a skill the content no longer declares instead of resurrecting it', async () => {
    const shared = store();
    const history = historyRepos({
      attempts: [{ id: 'a3', userId: USER, quizId: 'q', submittedAt: T1, passed: true }],
      answers: [{ attemptId: 'a3', questionId: 'question-disparue', isCorrect: true }],
      completions: [
        { userId: USER, chapterId: 'chapitre-disparu', status: 'COMPLETED' as const, completedAt: T2 },
      ],
    });

    const replay = make(shared, history);

    const report = await replay.replay(USER);
    // Neither the vanished question nor the vanished chapter creates a score.
    expect(shared.mastery).toHaveLength(0);
    expect(report.skills).toBe(0);
  });

  it('starts from nothing for a learner with no history', async () => {
    const shared = store();
    const history = historyRepos({});
    const replay = make(shared, history);

    const report = await replay.replay(USER);
    expect(report).toMatchObject({ events: 0, skills: 0 });
    expect(shared.mastery).toHaveLength(0);
  });

  it('wipes stale rows for the learner it replays', async () => {
    const shared = store();
    shared.mastery.push({
      userId: USER,
      skillId: 'compétence-obsolète',
      masteryScore: 99,
    } as SkillMasteryEntity);

    await buildReplay(shared).replay(USER);
    expect(shared.mastery.map((row) => row.skillId)).not.toContain('compétence-obsolète');
  });
});
