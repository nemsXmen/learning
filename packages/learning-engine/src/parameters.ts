/**
 * Every coefficient the engine uses, in one reviewable place. No numeric literal
 * lives anywhere else in this package (features/09-learning-engine-core).
 *
 * The CDC describes these formulas conceptually (§15, §16, §25, §26) without
 * giving values. The defaults below are a starting point tuned against the
 * trajectory fixtures in `trajectory.test.ts` — every one of them is an open
 * question recorded in docs/decisions.md, not a settled truth.
 */
export const PARAMETERS = {
  version: 1,

  mastery: {
    /** Share of the gap to the attempt's score absorbed by one attempt. */
    baseGainRate: 0.45,
    /** A harder skill moves more per attempt: 1 + (difficulty - 3) * this. */
    difficultyWeight: 0.08,
    /** Movement shrinks as evidence accumulates: rate / (1 + reviews * this). */
    diminishingPerReview: 0.18,
    /** No single attempt may move mastery further than this. */
    maxDeltaPerAttempt: 25,
    /** Chapter completion contributes, but counts for less than a graded attempt. */
    chapterCompletionWeight: 0.35,
    /** At or above this, a skill counts as mastered. */
    masteredThreshold: 80,
    /** Below this, a skill is weak enough to surface as needing attention. */
    weakThreshold: 60,
    /** Prerequisite mastery required before a chapter unlocks. */
    unlockThreshold: 60,
  },

  confidence: {
    /** Answers needed for the evidence term to reach one half. */
    evidenceHalfLife: 8,
  },

  forgetting: {
    /** Days of stability for a freshly learned, average-mastery skill. */
    baseStabilityDays: 3,
    /** Each completed review multiplies stability by 1 + this. */
    stabilityPerReview: 0.6,
    /** Mastery contributes up to this many extra days of stability. */
    stabilityFromMasteryDays: 6,
  },

  priority: {
    /** Exponents on each factor of the CDC §15 product. */
    weaknessWeight: 1,
    forgettingWeight: 1,
    importanceWeight: 0.6,
    prerequisiteWeight: 0.5,
    /** Factors are lifted into [floor, 1] so one of them cannot zero the product. */
    factorFloor: 0.25,
    /** Downstream dependants counted before prerequisite impact saturates. */
    prerequisiteSaturation: 4,
    highBand: 0.45,
    mediumBand: 0.2,
  },

  review: {
    /** CDC §16: day 1, 3, 7, 14, 30, then monthly-ish. */
    ladderDays: [1, 3, 7, 14, 30, 60],
    /** A failure divides the current interval by this before clamping. */
    failureDivisor: 3,
    minIntervalDays: 1,
    maxIntervalDays: 60,
  },

  difficulty: {
    bands: ['easy', 'medium', 'hard', 'expert'],
    /** Consecutive successes before the band moves up. */
    promoteAfterSuccesses: 2,
    /** Consecutive failures before the band moves down. */
    demoteAfterFailures: 1,
  },

  /** CDC §65 returns an estimate alongside the priority. */
  reviewEstimate: {
    /** A quick refresher on a skill barely below threshold. */
    minMinutes: 3,
    /** A skill at zero mastery, never reviewed, blocking the path. */
    maxMinutes: 10,
  },

  boost: {
    minMinutes: 5,
    maxMinutes: 15,
    /** How many skills one session may target. */
    maxTargetSkills: 3,
    stepMinutes: {
      QUESTION: 1,
      EXPLANATION: 2,
      EXERCISE: 3,
      MINI_TEST: 2,
    },
  },

  xp: {
    /** CDC §25. */
    CHAPTER_READ: 10,
    QUIZ_PASSED: 20,
    EXERCISE_COMPLETED: 40,
    CHAPTER_TEST_PASSED: 100,
    BOOST_COMPLETED: 50,
    PROJECT_COMPLETED: 500,
    /** CDC §26: beating your own score is worth something, repeating is not. */
    SCORE_IMPROVED: 20,
    /** An improvement must be at least this many points to count. */
    minimumImprovement: 5,
  },
} as const;

export type Parameters = typeof PARAMETERS;
