import { PARAMETERS } from '@app/learning-engine';
import { DomainEvents, type XpAwarded } from '../events/domain-events';
import { earnedAchievements, ACHIEVEMENTS } from './achievements';
import { StreakService } from './streak.service';
import { XpService } from './xp.service';
import type { XpTransactionEntity, StreakEntity } from './gamification.entities';

const USER = '00000000-0000-4000-8000-000000000001';
const NOW = new Date('2026-09-10T10:00:00Z');

/** An in-memory ledger that honours the uniqueness constraint, like Postgres. */
function ledgerRepo(seed: Partial<XpTransactionEntity>[] = []) {
  const rows: XpTransactionEntity[] = [];
  const key = (row: Partial<XpTransactionEntity>) =>
    `${row.userId}:${row.reason}:${row.referenceType}:${row.referenceId}`;

  for (const row of seed) {
    rows.push({ amount: 0, detail: '', createdAt: NOW, ...row } as XpTransactionEntity);
  }

  return {
    rows,
    find: jest.fn(async ({ where }: { where: { userId: string } }) =>
      rows.filter((row) => row.userId === where.userId),
    ),
    findOne: jest.fn(async ({ where }: { where: Partial<XpTransactionEntity> }) =>
      rows.find((row) => key(row) === key(where)) ?? null,
    ),
    insert: jest.fn(async (row: XpTransactionEntity) => {
      if (rows.some((existing) => key(existing) === key(row))) {
        throw Object.assign(new Error('duplicate key'), { code: '23505' });
      }
      rows.push({ ...row, createdAt: row.createdAt ?? NOW } as XpTransactionEntity);
    }),
  };
}

function streakRepo(seed?: Partial<StreakEntity>) {
  const rows = new Map<string, StreakEntity>();
  if (seed) rows.set(seed.userId!, { currentDays: 0, longestDays: 0, lastActiveDate: null, ...seed } as StreakEntity);
  return {
    rows,
    findOne: jest.fn(async ({ where }: { where: { userId: string } }) => rows.get(where.userId) ?? null),
    upsert: jest.fn(async (row: StreakEntity) => {
      rows.set(row.userId, row);
    }),
  };
}

function userRepo(timezone = 'Europe/Paris') {
  return { findOne: jest.fn(async () => ({ id: USER, timezone })) };
}

function build(options: { ledger?: Partial<XpTransactionEntity>[]; streak?: Partial<StreakEntity>; timezone?: string } = {}) {
  const ledger = ledgerRepo(options.ledger);
  const streaks = streakRepo(options.streak);
  const events = new DomainEvents();
  const streakService = new StreakService(streaks as never, userRepo(options.timezone) as never);
  const xp = new XpService(events, streakService, ledger as never);
  return { xp, ledger, streaks, streakService, events };
}

/* -------------------------------------------------------------------------- */
/* The ledger                                                                  */
/* -------------------------------------------------------------------------- */

describe('XpService.award', () => {
  const chapter = {
    userId: USER,
    reason: 'CHAPTER_READ' as const,
    referenceType: 'chapter',
    referenceId: 'javascript-variables',
    occurredAt: NOW,
  };

  it('pays the documented amount for a first chapter read', async () => {
    const { xp, ledger } = build();
    expect(await xp.award(chapter)).toBe(PARAMETERS.xp.CHAPTER_READ);
    expect(ledger.rows).toHaveLength(1);
  });

  it('pays nothing the second time: re-reading earns zero (CDC §26)', async () => {
    const { xp, ledger } = build();
    await xp.award(chapter);
    expect(await xp.award(chapter)).toBe(0);
    expect(ledger.rows).toHaveLength(1);
  });

  it('treats a concurrent duplicate as already paid rather than failing', async () => {
    const { xp, ledger } = build();
    const [a, b] = await Promise.all([xp.award(chapter), xp.award(chapter)]);

    // The unique constraint is the real guard; one of the two wins.
    expect([a, b].filter((amount) => amount > 0)).toHaveLength(1);
    expect(ledger.rows).toHaveLength(1);
  });

  it('stores the engine sentence alongside the amount', async () => {
    const { xp, ledger } = build();
    await xp.award(chapter);
    expect(ledger.rows[0]!.detail).toContain('XP');
  });

  it('emits xp.awarded only when something was actually paid', async () => {
    const { xp, events } = build();
    const seen: XpAwarded[] = [];
    events.on('xp.awarded', (payload) => {
      seen.push(payload);
    });

    await xp.award(chapter);
    await xp.award(chapter);

    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ amount: PARAMETERS.xp.CHAPTER_READ });
  });
});

describe('XpService.onAttemptGraded', () => {
  const attempt = (overrides: Record<string, unknown> = {}) =>
    ({
      userId: USER,
      attemptId: 'attempt-1',
      quizId: 'javascript-variables-quiz',
      chapterId: 'javascript-variables',
      source: 'CHAPTER',
      scorePercent: 80,
      passed: true,
      previousBestScore: null,
      skillOutcomes: [],
      occurredAt: NOW,
      ...overrides,
    }) as never;

  it('pays nothing for a failed attempt', async () => {
    const { xp, ledger } = build();
    await xp.onAttemptGraded(attempt({ passed: false }));
    expect(ledger.rows).toHaveLength(0);
  });

  it('pays the quiz on the first pass', async () => {
    const { xp, ledger } = build();
    await xp.onAttemptGraded(attempt());
    expect(ledger.rows[0]).toMatchObject({
      reason: 'QUIZ_PASSED',
      amount: PARAMETERS.xp.QUIZ_PASSED,
    });
  });

  it('pays nothing for a repeat that does not beat the best score', async () => {
    const { xp, ledger } = build();
    await xp.onAttemptGraded(attempt());
    await xp.onAttemptGraded(
      attempt({ attemptId: 'attempt-2', previousBestScore: 80, scorePercent: 80 }),
    );

    // Redoing the same quiz for the same result is not effort (CDC §26).
    expect(ledger.rows).toHaveLength(1);
  });

  it('pays an improvement that clears the minimum', async () => {
    const { xp, ledger } = build();
    await xp.onAttemptGraded(attempt());
    await xp.onAttemptGraded(
      attempt({ attemptId: 'attempt-2', previousBestScore: 80, scorePercent: 100 }),
    );

    expect(ledger.rows).toHaveLength(2);
    expect(ledger.rows[1]).toMatchObject({
      reason: 'SCORE_IMPROVED',
      amount: PARAMETERS.xp.SCORE_IMPROVED,
    });
  });

  it('pays nothing for an improvement too small to count', async () => {
    const { xp, ledger } = build();
    await xp.onAttemptGraded(attempt());
    await xp.onAttemptGraded(
      attempt({ attemptId: 'attempt-2', previousBestScore: 80, scorePercent: 82 }),
    );
    expect(ledger.rows).toHaveLength(1);
  });
});

describe('XpService.summary', () => {
  it('derives the total from the rows, never from a counter', async () => {
    const { xp, ledger } = build();
    await xp.award({
      userId: USER,
      reason: 'CHAPTER_READ',
      referenceType: 'chapter',
      referenceId: 'a',
      occurredAt: NOW,
    });
    await xp.award({
      userId: USER,
      reason: 'CHAPTER_TEST_PASSED',
      referenceType: 'quiz',
      referenceId: 'b',
      occurredAt: NOW,
    });

    const summary = await xp.summary(USER, NOW);
    expect(summary.total).toBe(ledger.rows.reduce((sum, row) => sum + row.amount, 0));
    expect(summary.level).toBeGreaterThanOrEqual(1);
  });

  it('counts today separately from the total', async () => {
    const { xp } = build({
      ledger: [
        { userId: USER, amount: 40, reason: 'CHAPTER_READ', referenceType: 'chapter', referenceId: 'vieux', createdAt: new Date('2026-09-01T10:00:00Z') },
        { userId: USER, amount: 10, reason: 'QUIZ_PASSED', referenceType: 'quiz', referenceId: 'today', createdAt: NOW },
      ],
    });

    const summary = await xp.summary(USER, NOW);
    expect(summary.total).toBe(50);
    expect(summary.todayXp).toBe(10);
  });

  it('starts a new learner at zero and level 1', async () => {
    const { xp } = build();
    expect(await xp.summary(USER, NOW)).toMatchObject({ total: 0, todayXp: 0, level: 1 });
  });
});

/* -------------------------------------------------------------------------- */
/* Streak                                                                      */
/* -------------------------------------------------------------------------- */

describe('StreakService', () => {
  it('starts a streak on the first activity', async () => {
    const { streakService } = build();
    const view = await streakService.recordActivity(USER, NOW);
    expect(view.currentDays).toBe(1);
    expect(view.activeToday).toBe(true);
  });

  it('counts at most once per local day', async () => {
    const { streakService, streaks } = build();
    await streakService.recordActivity(USER, new Date('2026-09-10T08:00:00Z'));
    await streakService.recordActivity(USER, new Date('2026-09-10T20:00:00Z'));

    // 20:00 UTC is 22:00 in Paris, still the same day.
    expect(streaks.rows.get(USER)!.currentDays).toBe(1);
  });

  it('extends on a consecutive day', async () => {
    const { streakService, streaks } = build();
    await streakService.recordActivity(USER, new Date('2026-09-10T08:00:00Z'));
    await streakService.recordActivity(USER, new Date('2026-09-11T08:00:00Z'));
    expect(streaks.rows.get(USER)!.currentDays).toBe(2);
  });

  it('resets after a missed day but keeps the record', async () => {
    const { streakService, streaks } = build();
    await streakService.recordActivity(USER, new Date('2026-09-10T08:00:00Z'));
    await streakService.recordActivity(USER, new Date('2026-09-11T08:00:00Z'));
    await streakService.recordActivity(USER, new Date('2026-09-14T08:00:00Z'));

    const row = streaks.rows.get(USER)!;
    expect(row.currentDays).toBe(1);
    expect(row.longestDays).toBe(2);
  });

  it('uses the learner timezone, not the server one', async () => {
    // 23:30 UTC on the 10th is already the 11th in Tokyo.
    const { streakService, streaks } = build({ timezone: 'Asia/Tokyo' });
    await streakService.recordActivity(USER, new Date('2026-09-10T08:00:00Z'));
    await streakService.recordActivity(USER, new Date('2026-09-10T23:30:00Z'));
    expect(streaks.rows.get(USER)!.currentDays).toBe(2);
  });

  it('reports a learner with no activity as inactive today', async () => {
    const { streakService } = build();
    const view = await streakService.view(USER, NOW);
    expect(view).toMatchObject({ currentDays: 0, activeToday: false });
  });
});

/* -------------------------------------------------------------------------- */
/* Achievements                                                                */
/* -------------------------------------------------------------------------- */

describe('earnedAchievements', () => {
  const base = {
    xp: { total: 0, todayXp: 0, level: 1, levelStartXp: 0, nextLevelXp: 100, levelProgressPercent: 0, xpToNextLevel: 100 },
    streak: { currentDays: 0, longestDays: 0, lastActiveDate: null, activeToday: false, atRisk: false, timezone: 'Europe/Paris' },
    masteredSkills: 0,
    completedChapters: 0,
  };

  it('gives nothing to a learner who has done nothing', () => {
    expect(earnedAchievements(base)).toEqual([]);
  });

  it('unlocks the first chapter', () => {
    expect(earnedAchievements({ ...base, completedChapters: 1 })).toContain('FIRST_CHAPTER');
  });

  it('unlocks streak badges at their thresholds, not before', () => {
    expect(earnedAchievements({ ...base, streak: { ...base.streak, currentDays: 6 } })).not.toContain('STREAK_7');
    expect(earnedAchievements({ ...base, streak: { ...base.streak, currentDays: 7 } })).toContain('STREAK_7');
    expect(earnedAchievements({ ...base, streak: { ...base.streak, currentDays: 30 } })).toContain('STREAK_30');
  });

  it('is cumulative: a long streak keeps the earlier badge', () => {
    const earned = earnedAchievements({ ...base, streak: { ...base.streak, currentDays: 30 } });
    expect(earned).toEqual(expect.arrayContaining(['STREAK_7', 'STREAK_30']));
  });

  it('every definition is reachable and has readable copy', () => {
    const all = earnedAchievements({
      ...base,
      xp: { ...base.xp, level: 50 },
      streak: { ...base.streak, currentDays: 365 },
      masteredSkills: 20,
      completedChapters: 100,
    });
    expect(all).toHaveLength(ACHIEVEMENTS.length);

    for (const achievement of ACHIEVEMENTS) {
      expect(achievement.title.length).toBeGreaterThan(2);
      expect(achievement.description.length).toBeGreaterThan(10);
    }
  });
});
