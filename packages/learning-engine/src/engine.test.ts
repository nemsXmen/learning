import { describe, expect, it } from 'vitest';
import {
  adjustDifficulty,
  applyChapterCompletion,
  calculateConfidence,
  calculateForgettingRisk,
  calculateMastery,
  calculateReviewPriority,
  calculateXP,
  detectWeakSkills,
  EngineInputError,
  generateBoostSession,
  isChapterUnlocked,
  daysOverdue,
  isDue,
  isMastered,
  isStreakAtRisk,
  isWeak,
  localDay,
  PARAMETERS,
  prerequisiteImpact,
  recommendNextAction,
  recommendNextChapter,
  scheduleNextReview,
  updateStreak,
  type ChapterRef,
  type QuestionRef,
  type SkillGraph,
  type SkillSnapshot,
} from './index';

const NOW = new Date('2026-09-08T10:00:00Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000);

function skill(overrides: Partial<SkillSnapshot> = {}): SkillSnapshot {
  return {
    skillId: 'closures',
    masteryScore: 50,
    confidenceScore: 50,
    successCount: 5,
    failureCount: 5,
    difficulty: 3,
    importance: 3,
    lastAttemptAt: daysAgo(1),
    lastReviewedAt: daysAgo(1),
    nextReviewAt: null,
    reviewCount: 1,
    intervalDays: 3,
    ...overrides,
  };
}

const GRAPH: SkillGraph = {
  requires: {
    scope: ['variables'],
    closures: ['scope', 'functions'],
    promises: ['functions'],
    'event-loop': ['promises'],
  },
};

/* -------------------------------------------------------------------------- */
/* Mastery                                                                     */
/* -------------------------------------------------------------------------- */

describe('calculateMastery', () => {
  it('raises mastery on a perfect attempt and lowers it on a failed one', () => {
    const up = calculateMastery(skill(), { skillId: 'closures', correct: 4, incorrect: 0 }, NOW);
    const down = calculateMastery(skill(), { skillId: 'closures', correct: 0, incorrect: 4 }, NOW);

    expect(up.delta).toBeGreaterThan(0);
    expect(up.masteryScore).toBeGreaterThan(50);
    expect(down.delta).toBeLessThan(0);
    expect(down.masteryScore).toBeLessThan(50);
  });

  it('moves further on a harder skill than on an easy one', () => {
    const outcome = { skillId: 'closures', correct: 4, incorrect: 0 };
    const easy = calculateMastery(skill({ difficulty: 1 }), outcome, NOW);
    const hard = calculateMastery(skill({ difficulty: 5 }), outcome, NOW);
    expect(hard.delta).toBeGreaterThan(easy.delta);
  });

  it('moves less as evidence accumulates', () => {
    const outcome = { skillId: 'closures', correct: 4, incorrect: 0 };
    const fresh = calculateMastery(skill({ reviewCount: 0 }), outcome, NOW);
    const seasoned = calculateMastery(skill({ reviewCount: 10 }), outcome, NOW);
    expect(seasoned.delta).toBeLessThan(fresh.delta);
  });

  it('never moves further than the documented cap', () => {
    const result = calculateMastery(
      skill({ masteryScore: 0, difficulty: 5, reviewCount: 0 }),
      { skillId: 'closures', correct: 20, incorrect: 0 },
      NOW,
    );
    expect(Math.abs(result.delta)).toBeLessThanOrEqual(PARAMETERS.mastery.maxDeltaPerAttempt);
  });

  it('keeps scores inside 0..100 at both extremes', () => {
    const floor = calculateMastery(
      skill({ masteryScore: 0 }),
      { skillId: 'closures', correct: 0, incorrect: 10 },
      NOW,
    );
    const ceiling = calculateMastery(
      skill({ masteryScore: 100 }),
      { skillId: 'closures', correct: 10, incorrect: 0 },
      NOW,
    );
    expect(floor.masteryScore).toBe(0);
    expect(ceiling.masteryScore).toBe(100);
  });

  it('leaves mastery untouched when the attempt asked nothing', () => {
    const result = calculateMastery(skill(), { skillId: 'closures', correct: 0, incorrect: 0 }, NOW);
    expect(result.delta).toBe(0);
    expect(result.masteryScore).toBe(50);
  });

  it('is deterministic', () => {
    const outcome = { skillId: 'closures', correct: 3, incorrect: 1 };
    expect(calculateMastery(skill(), outcome, NOW)).toEqual(calculateMastery(skill(), outcome, NOW));
  });

  it('explains the movement in the reason', () => {
    const result = calculateMastery(skill(), { skillId: 'closures', correct: 3, incorrect: 1 }, NOW);
    expect(result.reason).toContain('3/4');
    expect(result.reason.length).toBeGreaterThan(10);
  });

  it('rejects an out-of-range input rather than clamping it silently', () => {
    expect(() =>
      calculateMastery(skill({ masteryScore: 140 }), { skillId: 'c', correct: 1, incorrect: 0 }, NOW),
    ).toThrow(EngineInputError);
    expect(() => calculateMastery(skill(), { skillId: 'c', correct: 1, incorrect: 0 }, new Date('nope'))).toThrow(
      EngineInputError,
    );
  });
});

describe('calculateConfidence', () => {
  it('is zero without evidence and grows with answers', () => {
    expect(calculateConfidence(50, 0, 0)).toBe(0);
    expect(calculateConfidence(50, 20, 20)).toBeGreaterThan(calculateConfidence(50, 2, 2));
  });

  it('falls when the score disagrees with the raw ratio', () => {
    const agreeing = calculateConfidence(50, 10, 10);
    const disagreeing = calculateConfidence(95, 10, 10);
    expect(disagreeing).toBeLessThan(agreeing);
  });
});

describe('applyChapterCompletion', () => {
  it('counts for less than a graded attempt', () => {
    const graded = calculateMastery(skill(), { skillId: 'closures', correct: 1, incorrect: 0 }, NOW);
    const read = applyChapterCompletion(skill(), NOW);
    expect(read.delta).toBeGreaterThan(0);
    expect(read.delta).toBeLessThan(graded.delta);
  });
});

/* -------------------------------------------------------------------------- */
/* Forgetting                                                                  */
/* -------------------------------------------------------------------------- */

describe('calculateForgettingRisk', () => {
  it('is minimal right after a review and rises with time', () => {
    const fresh = calculateForgettingRisk(skill({ lastReviewedAt: NOW }), NOW);
    const stale = calculateForgettingRisk(skill({ lastReviewedAt: daysAgo(30) }), NOW);
    expect(fresh).toBeCloseTo(0, 5);
    expect(stale).toBeGreaterThan(0.9);
  });

  it('is monotone in days since review', () => {
    const risks = [1, 3, 7, 14, 30].map((d) =>
      calculateForgettingRisk(skill({ lastReviewedAt: daysAgo(d) }), NOW),
    );
    for (let i = 1; i < risks.length; i += 1) {
      expect(risks[i]!).toBeGreaterThan(risks[i - 1]!);
    }
  });

  it('falls as mastery and review count rise', () => {
    const base = { lastReviewedAt: daysAgo(7) };
    expect(calculateForgettingRisk(skill({ ...base, masteryScore: 90 }), NOW)).toBeLessThan(
      calculateForgettingRisk(skill({ ...base, masteryScore: 20 }), NOW),
    );
    expect(calculateForgettingRisk(skill({ ...base, reviewCount: 8 }), NOW)).toBeLessThan(
      calculateForgettingRisk(skill({ ...base, reviewCount: 0 }), NOW),
    );
  });

  it('is zero for a skill never practised: there is nothing to forget', () => {
    expect(
      calculateForgettingRisk(skill({ lastReviewedAt: null, lastAttemptAt: null }), NOW),
    ).toBe(0);
  });

  it('falls back to the last attempt when no review was recorded', () => {
    const risk = calculateForgettingRisk(
      skill({ lastReviewedAt: null, lastAttemptAt: daysAgo(10) }),
      NOW,
    );
    expect(risk).toBeGreaterThan(0.5);
  });
});

describe('isDue', () => {
  it('is false without a schedule and true once the date has passed', () => {
    expect(isDue(skill({ nextReviewAt: null }), NOW)).toBe(false);
    expect(isDue(skill({ nextReviewAt: daysAgo(1) }), NOW)).toBe(true);
    expect(isDue(skill({ nextReviewAt: new Date(NOW.getTime() + 86_400_000) }), NOW)).toBe(false);
  });
});

describe('daysOverdue', () => {
  it('is zero without a schedule and counts the days past it', () => {
    expect(daysOverdue(skill({ nextReviewAt: null }), NOW)).toBe(0);
    expect(daysOverdue(skill({ nextReviewAt: daysAgo(4) }), NOW)).toBeCloseTo(4, 5);
    expect(daysOverdue(skill({ nextReviewAt: new Date(NOW.getTime() + 86_400_000) }), NOW)).toBe(0);
  });
});

describe('mastery thresholds', () => {
  it('names the mastered and weak bands from the parameters', () => {
    expect(isMastered(PARAMETERS.mastery.masteredThreshold)).toBe(true);
    expect(isMastered(PARAMETERS.mastery.masteredThreshold - 1)).toBe(false);
    expect(isWeak(PARAMETERS.mastery.weakThreshold - 1)).toBe(true);
    expect(isWeak(PARAMETERS.mastery.weakThreshold)).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Priority                                                                    */
/* -------------------------------------------------------------------------- */

describe('calculateReviewPriority', () => {
  it('is monotone in weakness, holding the rest fixed', () => {
    const weak = calculateReviewPriority(skill({ masteryScore: 20 }), GRAPH, NOW);
    const strong = calculateReviewPriority(skill({ masteryScore: 80 }), GRAPH, NOW);
    expect(weak.priority).toBeGreaterThan(strong.priority);
  });

  it('is monotone in forgetting risk', () => {
    const stale = calculateReviewPriority(skill({ lastReviewedAt: daysAgo(30) }), GRAPH, NOW);
    const fresh = calculateReviewPriority(skill({ lastReviewedAt: NOW }), GRAPH, NOW);
    expect(stale.priority).toBeGreaterThan(fresh.priority);
  });

  it('is monotone in importance', () => {
    const critical = calculateReviewPriority(skill({ importance: 5 }), GRAPH, NOW);
    const minor = calculateReviewPriority(skill({ importance: 1 }), GRAPH, NOW);
    expect(critical.priority).toBeGreaterThan(minor.priority);
  });

  it('is monotone in prerequisite impact', () => {
    const blocking = calculateReviewPriority(skill({ skillId: 'functions' }), GRAPH, NOW);
    const leaf = calculateReviewPriority(skill({ skillId: 'event-loop' }), GRAPH, NOW);
    expect(blocking.priority).toBeGreaterThan(leaf.priority);
  });

  it('does not collapse to zero just because a skill was reviewed today', () => {
    const justReviewed = calculateReviewPriority(
      skill({ masteryScore: 20, lastReviewedAt: NOW }),
      GRAPH,
      NOW,
    );
    expect(justReviewed.priority).toBeGreaterThan(0);
  });

  it('is zero for a fully mastered skill', () => {
    expect(calculateReviewPriority(skill({ masteryScore: 100 }), GRAPH, NOW).priority).toBe(0);
  });

  it('stays inside 0..1 and reports its factors', () => {
    const result = calculateReviewPriority(skill({ masteryScore: 0, importance: 5 }), GRAPH, NOW);
    expect(result.priority).toBeGreaterThanOrEqual(0);
    expect(result.priority).toBeLessThanOrEqual(1);
    expect(Object.keys(result.factors)).toEqual([
      'weakness',
      'forgettingRisk',
      'importance',
      'prerequisiteImpact',
    ]);
  });

  it('bands the priority', () => {
    const high = calculateReviewPriority(
      skill({ skillId: 'functions', masteryScore: 5, importance: 5, lastReviewedAt: daysAgo(60) }),
      GRAPH,
      NOW,
    );
    const low = calculateReviewPriority(skill({ masteryScore: 95 }), GRAPH, NOW);
    expect(high.band).toBe('high');
    expect(low.band).toBe('low');
  });

  it('gives a reason a screen can show verbatim', () => {
    const result = calculateReviewPriority(
      skill({ masteryScore: 48, failureCount: 3, lastReviewedAt: daysAgo(6) }),
      GRAPH,
      NOW,
    );
    expect(result.reason).toContain('48 %');
    expect(result.reason).toContain('3 fois');
    // Credible tone, never "🔥🔥🔥 TU ES INCROYABLE" (CDC §78).
    expect(result.reason).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });
});

describe('prerequisiteImpact', () => {
  it('counts the skills held back by this one', () => {
    expect(prerequisiteImpact('functions', GRAPH)).toBeGreaterThan(
      prerequisiteImpact('event-loop', GRAPH),
    );
    expect(prerequisiteImpact('inconnue', GRAPH)).toBe(0);
  });
});

describe('estimatedMinutes', () => {
  it('rises with priority, between the documented bounds', () => {
    const urgent = calculateReviewPriority(
      skill({ masteryScore: 5, lastReviewedAt: daysAgo(60), importance: 5 }),
      GRAPH,
      NOW,
    );
    const mild = calculateReviewPriority(
      skill({ masteryScore: 58, lastReviewedAt: NOW, importance: 1 }),
      GRAPH,
      NOW,
    );

    expect(urgent.estimatedMinutes).toBeGreaterThan(mild.estimatedMinutes);
    for (const result of [urgent, mild]) {
      expect(result.estimatedMinutes).toBeGreaterThanOrEqual(PARAMETERS.reviewEstimate.minMinutes);
      expect(result.estimatedMinutes).toBeLessThanOrEqual(PARAMETERS.reviewEstimate.maxMinutes);
    }
  });

  it('is a whole number of minutes: it is shown to a learner', () => {
    const result = calculateReviewPriority(skill({ masteryScore: 37 }), GRAPH, NOW);
    expect(Number.isInteger(result.estimatedMinutes)).toBe(true);
  });
});

describe('detectWeakSkills', () => {
  const skills = [
    skill({ skillId: 'event-loop', masteryScore: 43 }),
    skill({ skillId: 'prototypes', masteryScore: 51 }),
    skill({ skillId: 'closures', masteryScore: 82 }),
    skill({ skillId: 'variables', masteryScore: 95 }),
  ];

  it('returns only skills under the weak threshold, most urgent first', () => {
    const weak = detectWeakSkills(skills, GRAPH, NOW, 5);
    expect(weak.map((entry) => entry.skillId)).toEqual(['event-loop', 'prototypes']);
    expect(weak[0]!.priority).toBeGreaterThanOrEqual(weak[1]!.priority);
  });

  it('respects the limit and returns nothing when all is mastered', () => {
    expect(detectWeakSkills(skills, GRAPH, NOW, 1)).toHaveLength(1);
    expect(detectWeakSkills([skill({ masteryScore: 90 })], GRAPH, NOW)).toEqual([]);
  });

  it('breaks ties deterministically', () => {
    const tied = [skill({ skillId: 'b', masteryScore: 40 }), skill({ skillId: 'a', masteryScore: 40 })];
    expect(detectWeakSkills(tied, GRAPH, NOW).map((e) => e.skillId)).toEqual(['a', 'b']);
  });
});

/* -------------------------------------------------------------------------- */
/* Review schedule and difficulty                                              */
/* -------------------------------------------------------------------------- */

describe('scheduleNextReview', () => {
  it('follows the CDC ladder on a clean success streak', () => {
    let current = skill({ intervalDays: 0 });
    const ladder: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      const next = scheduleNextReview(current, true, NOW);
      ladder.push(next.intervalDays);
      current = skill({ intervalDays: next.intervalDays });
    }
    expect(ladder).toEqual([1, 3, 7, 14, 30, 60]);
  });

  it('shortens on failure and never goes below the minimum', () => {
    expect(scheduleNextReview(skill({ intervalDays: 30 }), false, NOW).intervalDays).toBe(10);
    expect(scheduleNextReview(skill({ intervalDays: 1 }), false, NOW).intervalDays).toBe(1);
  });

  it('never exceeds the maximum interval', () => {
    expect(scheduleNextReview(skill({ intervalDays: 60 }), true, NOW).intervalDays).toBe(60);
  });

  it('places the next review the right number of days out', () => {
    const result = scheduleNextReview(skill({ intervalDays: 3 }), true, NOW);
    expect(result.nextReviewAt.getTime() - NOW.getTime()).toBe(7 * 86_400_000);
    expect(result.reason).toContain('7 jours');
  });
});

describe('adjustDifficulty', () => {
  it('promotes after a run of successes and demotes after a failure', () => {
    expect(adjustDifficulty('medium', 2, 0).band).toBe('hard');
    expect(adjustDifficulty('medium', 0, 1).band).toBe('easy');
  });

  it('holds without a run', () => {
    expect(adjustDifficulty('medium', 1, 0).band).toBe('medium');
  });

  it('clamps at both ends of the four bands', () => {
    expect(adjustDifficulty('expert', 5, 0).band).toBe('expert');
    expect(adjustDifficulty('easy', 0, 3).band).toBe('easy');
  });

  it('lets failure win over success when both runs are present', () => {
    expect(adjustDifficulty('hard', 5, 2).band).toBe('medium');
  });
});

/* -------------------------------------------------------------------------- */
/* XP                                                                          */
/* -------------------------------------------------------------------------- */

describe('calculateXP', () => {
  it.each([
    ['CHAPTER_READ', 10],
    ['QUIZ_PASSED', 20],
    ['EXERCISE_COMPLETED', 40],
    ['CHAPTER_TEST_PASSED', 100],
    ['BOOST_COMPLETED', 50],
    ['PROJECT_COMPLETED', 500],
  ] as const)('awards the CDC value for %s', (reason, amount) => {
    expect(calculateXP({ reason, alreadyRewarded: false }).amount).toBe(amount);
  });

  it('pays nothing for effort already rewarded', () => {
    const result = calculateXP({ reason: 'CHAPTER_READ', alreadyRewarded: true });
    expect(result.amount).toBe(0);
    expect(result.reason).toContain('déjà récompensé');
  });

  it('pays only the delta for a genuine improvement', () => {
    expect(
      calculateXP({
        reason: 'SCORE_IMPROVED',
        alreadyRewarded: true,
        previousScore: 60,
        newScore: 85,
      }).amount,
    ).toBe(20);
  });

  it('ignores a negligible improvement', () => {
    expect(
      calculateXP({
        reason: 'SCORE_IMPROVED',
        alreadyRewarded: true,
        previousScore: 80,
        newScore: 82,
      }).amount,
    ).toBe(0);
  });

  it('ignores a worse score', () => {
    expect(
      calculateXP({
        reason: 'SCORE_IMPROVED',
        alreadyRewarded: true,
        previousScore: 90,
        newScore: 40,
      }).amount,
    ).toBe(0);
  });
});

/* -------------------------------------------------------------------------- */
/* Streak                                                                      */
/* -------------------------------------------------------------------------- */

describe('updateStreak', () => {
  const empty = { currentDays: 0, longestDays: 0, lastActiveDate: null };

  it('starts at one on the first day', () => {
    const result = updateStreak(empty, NOW, 'Europe/Paris');
    expect(result).toMatchObject({ currentDays: 1, longestDays: 1, lastActiveDate: '2026-09-08' });
  });

  it('increments on a consecutive day', () => {
    const day1 = updateStreak(empty, new Date('2026-09-07T20:00:00Z'), 'Europe/Paris');
    const day2 = updateStreak(day1, new Date('2026-09-08T08:00:00Z'), 'Europe/Paris');
    expect(day2.currentDays).toBe(2);
  });

  it('counts at most once per local day', () => {
    // Both instants must land on the same Paris day: 22:00 UTC would already be
    // the 9th locally, which is a different day and a legitimate increment.
    const first = updateStreak(empty, new Date('2026-09-08T08:00:00Z'), 'Europe/Paris');
    const again = updateStreak(first, new Date('2026-09-08T20:00:00Z'), 'Europe/Paris');
    expect(again.changed).toBe(false);
    expect(again.currentDays).toBe(1);
  });

  it('resets after a missed day but keeps the record', () => {
    const state = { currentDays: 7, longestDays: 7, lastActiveDate: '2026-09-05' };
    const result = updateStreak(state, NOW, 'Europe/Paris');
    expect(result.currentDays).toBe(1);
    expect(result.longestDays).toBe(7);
    expect(result.reason).toContain('manqué');
  });

  it('uses the learner timezone, not UTC', () => {
    // 23:30 UTC is already the next day in Paris, and still the previous one in Los Angeles.
    const instant = new Date('2026-09-08T23:30:00Z');
    expect(localDay(instant, 'Europe/Paris')).toBe('2026-09-09');
    expect(localDay(instant, 'America/Los_Angeles')).toBe('2026-09-08');
  });

  it('survives a daylight-saving transition', () => {
    // Paris moves off summer time on 2026-10-25.
    const before = new Date('2026-10-24T22:00:00Z'); // 2026-10-25 00:00 local
    const after = new Date('2026-10-25T23:00:00Z'); // 2026-10-26 00:00 local
    const day1 = updateStreak(empty, before, 'Europe/Paris');
    const day2 = updateStreak(day1, after, 'Europe/Paris');
    expect(day1.lastActiveDate).toBe('2026-10-25');
    expect(day2.lastActiveDate).toBe('2026-10-26');
    expect(day2.currentDays).toBe(2);
  });

  it('rejects an unknown timezone', () => {
    expect(() => updateStreak(empty, NOW, 'Mars/Olympus')).toThrow(EngineInputError);
    expect(() => localDay(new Date('nope'), 'Europe/Paris')).toThrow(EngineInputError);
  });
});

describe('isStreakAtRisk', () => {
  it('is true when yesterday was the last active day', () => {
    expect(
      isStreakAtRisk({ currentDays: 3, longestDays: 3, lastActiveDate: '2026-09-07' }, NOW, 'Europe/Paris'),
    ).toBe(true);
    expect(
      isStreakAtRisk({ currentDays: 3, longestDays: 3, lastActiveDate: '2026-09-08' }, NOW, 'Europe/Paris'),
    ).toBe(false);
    expect(isStreakAtRisk({ currentDays: 0, longestDays: 0, lastActiveDate: null }, NOW, 'Europe/Paris')).toBe(
      false,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Boost                                                                       */
/* -------------------------------------------------------------------------- */

const BANK: QuestionRef[] = [
  { questionId: 'q-el-1', skillId: 'event-loop', difficulty: 3, estimatedMinutes: 1 },
  { questionId: 'q-el-2', skillId: 'event-loop', difficulty: 4, estimatedMinutes: 1 },
  { questionId: 'q-el-3', skillId: 'event-loop', difficulty: 2, estimatedMinutes: 1 },
  { questionId: 'q-pr-1', skillId: 'prototypes', difficulty: 3, estimatedMinutes: 1 },
  { questionId: 'q-pr-2', skillId: 'prototypes', difficulty: 2, estimatedMinutes: 1 },
];

const WEAK_SKILLS = [
  skill({ skillId: 'event-loop', masteryScore: 43, lastReviewedAt: daysAgo(6) }),
  skill({ skillId: 'prototypes', masteryScore: 51, lastReviewedAt: daysAgo(3) }),
  skill({ skillId: 'variables', masteryScore: 95 }),
];

describe('generateBoostSession', () => {
  const input = {
    skills: WEAK_SKILLS,
    graph: GRAPH,
    availableMinutes: 8,
    questionBank: BANK,
    now: NOW,
  };

  it('targets the weak skills and stays within the budget', () => {
    const plan = generateBoostSession(input);
    expect(plan.targetSkillIds).toEqual(expect.arrayContaining(['event-loop', 'prototypes']));
    expect(plan.targetSkillIds).not.toContain('variables');
    expect(plan.estimatedMinutes).toBeLessThanOrEqual(8);
    expect(plan.steps.length).toBeGreaterThan(0);
  });

  it('never exceeds a five-minute budget', () => {
    const plan = generateBoostSession({ ...input, availableMinutes: 5 });
    expect(plan.estimatedMinutes).toBeLessThanOrEqual(5);
  });

  it('clamps a budget outside the documented range', () => {
    const tiny = generateBoostSession({ ...input, availableMinutes: 1 });
    const huge = generateBoostSession({ ...input, availableMinutes: 90 });
    expect(tiny.estimatedMinutes).toBeLessThanOrEqual(PARAMETERS.boost.minMinutes);
    expect(huge.estimatedMinutes).toBeLessThanOrEqual(PARAMETERS.boost.maxMinutes);
  });

  it('never asks the same question twice', () => {
    const refs = generateBoostSession({ ...input, availableMinutes: 15 })
      .steps.map((step) => step.ref)
      .filter((ref): ref is string => ref !== null);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it('is deterministic', () => {
    expect(generateBoostSession(input)).toEqual(generateBoostSession(input));
  });

  it('is unaffected by the order of the question bank', () => {
    const reversed = { ...input, questionBank: [...BANK].reverse() };
    expect(generateBoostSession(reversed).steps).toEqual(generateBoostSession(input).steps);
  });

  it('returns an empty plan with a reason when nothing needs reinforcing', () => {
    const plan = generateBoostSession({ ...input, skills: [skill({ masteryScore: 95 })] });
    expect(plan.steps).toEqual([]);
    expect(plan.estimatedMinutes).toBe(0);
    expect(plan.reason).toContain('rien à renforcer');
  });

  it('skips question steps for a skill with no questions left', () => {
    const plan = generateBoostSession({ ...input, questionBank: [] });
    expect(plan.steps.every((step) => step.kind === 'EXPLANATION')).toBe(true);
  });

  it('carries the top skill reason so the screen can show it', () => {
    expect(generateBoostSession(input).reason).toMatch(/score est de/i);
  });
});

/* -------------------------------------------------------------------------- */
/* Recommendation                                                              */
/* -------------------------------------------------------------------------- */

function chapter(overrides: Partial<ChapterRef> = {}): ChapterRef {
  return {
    chapterId: 'javascript-closures',
    technologySlug: 'javascript',
    estimatedMinutes: 30,
    skillIds: ['closures'],
    prerequisiteSkillIds: [],
    status: 'NOT_STARTED',
    ...overrides,
  };
}

describe('isChapterUnlocked', () => {
  it('requires every prerequisite skill to pass the threshold', () => {
    const skills = [skill({ skillId: 'scope', masteryScore: 70 }), skill({ skillId: 'functions', masteryScore: 30 })];
    expect(isChapterUnlocked(chapter({ prerequisiteSkillIds: ['scope'] }), skills)).toBe(true);
    expect(isChapterUnlocked(chapter({ prerequisiteSkillIds: ['scope', 'functions'] }), skills)).toBe(false);
    expect(isChapterUnlocked(chapter({ prerequisiteSkillIds: [] }), skills)).toBe(true);
  });

  it('treats an unknown prerequisite as unmet', () => {
    expect(isChapterUnlocked(chapter({ prerequisiteSkillIds: ['inconnue'] }), [])).toBe(false);
  });
});

describe('recommendNextChapter', () => {
  it('prefers the chapter already in progress', () => {
    const chapters = [chapter({ chapterId: 'a' }), chapter({ chapterId: 'b', status: 'IN_PROGRESS' })];
    expect(recommendNextChapter(chapters, [])?.chapterId).toBe('b');
  });

  it('falls back to the first unlocked chapter', () => {
    const chapters = [
      chapter({ chapterId: 'locked', prerequisiteSkillIds: ['scope'] }),
      chapter({ chapterId: 'open' }),
    ];
    expect(recommendNextChapter(chapters, [])?.chapterId).toBe('open');
  });

  it('returns null when nothing is available', () => {
    expect(recommendNextChapter([chapter({ status: 'COMPLETED' })], [])).toBeNull();
  });
});

describe('recommendNextAction', () => {
  const base = { graph: GRAPH, chapters: [chapter()], availableMinutes: 20, now: NOW };

  it('prefers an overdue weak skill over a new chapter', () => {
    const result = recommendNextAction({
      ...base,
      skills: [
        skill({
          skillId: 'event-loop',
          masteryScore: 30,
          importance: 5,
          nextReviewAt: daysAgo(2),
          lastReviewedAt: daysAgo(9),
        }),
      ],
    });
    expect(result.type).toBe('BOOST');
    expect(result.ref).toBe('event-loop');
    expect(result.reason).toContain('30 %');
  });

  it('opens the next chapter when nothing is due', () => {
    const result = recommendNextAction({ ...base, skills: [skill({ masteryScore: 90 })] });
    expect(result.type).toBe('NEXT_CHAPTER');
    expect(result.ref).toBe('javascript-closures');
    expect(result.estimatedMinutes).toBe(30);
  });

  it('prefers finishing a chapter already started', () => {
    const result = recommendNextAction({
      ...base,
      chapters: [chapter({ chapterId: 'en-cours', status: 'IN_PROGRESS' })],
      skills: [skill({ masteryScore: 90 })],
    });
    expect(result.ref).toBe('en-cours');
    expect(result.reason).toContain('en cours');
  });

  it('falls back to a review when nothing is unlocked but something is imperfect', () => {
    const result = recommendNextAction({
      ...base,
      chapters: [chapter({ status: 'COMPLETED' })],
      skills: [skill({ masteryScore: 55 })],
    });
    expect(result.type).toBe('REVIEW');
    expect(result.reason).toContain('Rien de nouveau');
  });

  it('says so plainly when everything is caught up', () => {
    const result = recommendNextAction({
      ...base,
      chapters: [chapter({ status: 'COMPLETED' })],
      skills: [skill({ masteryScore: 95 })],
    });
    expect(result.type).toBe('CAUGHT_UP');
    expect(result.ref).toBeNull();
    expect(result.reason).toContain('à jour');
  });

  it('handles a brand-new learner with no history', () => {
    const result = recommendNextAction({ ...base, skills: [] });
    expect(result.type).toBe('NEXT_CHAPTER');
  });

  it('always returns a non-empty reason', () => {
    const cases = [
      { ...base, skills: [] },
      { ...base, skills: [skill({ nextReviewAt: daysAgo(1), masteryScore: 20 })] },
      { ...base, chapters: [], skills: [skill({ masteryScore: 99 })] },
    ];
    for (const input of cases) {
      expect(recommendNextAction(input).reason.length).toBeGreaterThan(10);
    }
  });

  it('is deterministic', () => {
    const input = { ...base, skills: [skill({ masteryScore: 40, nextReviewAt: daysAgo(1) })] };
    expect(recommendNextAction(input)).toEqual(recommendNextAction(input));
  });
});
