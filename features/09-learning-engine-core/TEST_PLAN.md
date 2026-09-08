# Test plan

Coverage threshold is enforced on this package (CDC §73, §89.24).

## Unit

- `calculateMastery`: success raises, failure lowers, magnitude scales with difficulty,
  results stay in range, repeated identical attempts show diminishing movement.
- `calculateForgettingRisk`: rises with days since review, falls with mastery and
  review count; zero days since review is minimal risk.
- `calculateReviewPriority`: monotone in each of the four factors, holding others fixed.
- `scheduleNextReview`: success lengthens, failure shortens, bounded by min and max,
  matches the CDC §16 ladder for a clean success streak.
- `generateBoostSession`: respects the minute budget, prefers highest priority, never
  repeats a question within a session, is deterministic under a fixed seed.
- `recommendNextAction`: prefers an overdue high-priority review over a new chapter,
  prefers a new chapter when nothing is due, returns a completion state when everything
  is mastered.
- `calculateXP`: CDC §25 values, zero for a repeat, positive for an improved result (§26).
- `updateStreak`: consecutive days increment, a missed day resets, same-day activity does
  not double-count, timezone boundaries respected.
- `adjustDifficulty`: rises on success, falls on failure, clamped to the four bands.

## Integration

- Trajectory fixtures: a 30-day learner history replays to expected mastery, schedule
  and recommendations at each step.

## Edge cases and regression risks

- A brand-new learner with no history.
- A skill with zero attempts but high importance.
- Every skill mastered, nothing due.
- A cyclic or disconnected skill graph is rejected at the boundary.
- Daylight-saving transitions in streak calculations.
