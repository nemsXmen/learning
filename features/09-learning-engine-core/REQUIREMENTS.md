# Requirements

## Goal

Given a snapshot of what a learner has done, decide what they should do next, and be
able to explain why — deterministically, and provably by test.

## Scope

### Must

- Pure functions, one concern per file:
  `calculateMastery`, `calculateConfidence`, `calculateForgettingRisk`,
  `calculateReviewPriority`, `scheduleNextReview`, `detectWeakSkills`,
  `recommendNextChapter`, `generateBoostSession`, `calculateXP`, `updateStreak`,
  `adjustDifficulty`.
- One `parameters.ts` holding every coefficient, threshold and interval, documented
  and versioned — no numeric literal anywhere else in the package.
- Every decision returns a `reason` string plus the inputs that produced it (CDC §66).
- Spaced repetition with intervals that lengthen on success and shorten on failure
  (CDC §16), bounded by a documented minimum and maximum.
- Table-driven fixtures covering realistic learner trajectories.

### Must not

- No I/O, no database, no HTTP, no `Date.now()` — the clock is an input.
- No NestJS, React or ORM type anywhere in the package.
- No randomness unless a seed is passed in.
- No AI or model call (CDC §67, §89.11).
