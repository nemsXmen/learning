# Contract

## Inputs and outputs

```ts
type SkillSnapshot = {
  skillId: string; masteryScore: number; confidenceScore: number;
  successCount: number; failureCount: number; difficulty: 1|2|3|4|5;
  importance: 1|2|3|4|5; lastAttemptAt: Date | null;
  lastReviewedAt: Date | null; nextReviewAt: Date | null; reviewCount: number;
};

calculateMastery(previous: SkillSnapshot, outcome: AttemptOutcome, now: Date): MasteryResult
// → { masteryScore, confidenceScore, delta, reason }

calculateReviewPriority(skill: SkillSnapshot, graph: SkillGraph, now: Date): PriorityResult
// → { priority: 0..1, band: "low"|"medium"|"high", factors:
//     { weakness, forgettingRisk, importance, prerequisiteImpact }, reason }

generateBoostSession(input: {
  skills: SkillSnapshot[]; graph: SkillGraph; availableMinutes: number;
  questionBank: QuestionRef[]; now: Date; seed?: number;
}): BoostPlan
// → { targetSkillIds, steps: [{ kind, ref, estimatedMinutes }], estimatedMinutes, reason }

recommendNextAction(input: LearnerSnapshot): Recommendation
// → { type: "NEXT_CHAPTER"|"REVIEW"|"EXERCISE"|"QUIZ"|"BOOST"|"PROJECT"|"CAUGHT_UP",
//     ref, estimatedMinutes, priority, reason }
```

Mirrors CDC §65: `{ skill, mastery, confidence, failures, daysSinceReview, difficulty }`
→ `{ priority, action, estimatedMinutes, reason }`.

## Validation and errors

- Inputs are validated at the package boundary; an out-of-range score throws a typed
  `EngineInputError` naming the field rather than silently clamping.
- Every output score is clamped to its documented range after computation.

## Deviations from the CDC, and why

- `CAUGHT_UP` is a seventh recommendation type the CDC's six do not cover: nothing
  due, nothing left to unlock. Every screen still needs one thing to say (CDC §81),
  so the absence of an action is itself an action with a reason, not a `null`.
- CDC §15 gives `priority = weakness × forgettingRisk × importance ×
  prerequisiteImpact`. Taken literally, any factor at zero zeroes the result — a
  genuinely weak skill reviewed this morning would disappear from the list. Every
  factor except weakness is therefore lifted into `[floor, 1]` before multiplying:
  the shape of the formula is kept, the collapse is not. Weakness alone may still
  zero it, which is correct — a mastered skill needs nothing.

## Invariants

- Deterministic: same inputs and same clock produce the same output, always.
- `generateBoostSession` never exceeds `availableMinutes` and never returns zero steps
  when at least one weak skill has questions available.
- A boost session targets 5–15 minutes by default (CDC §17).
- Priority rises with weakness, forgetting risk, importance and prerequisite impact,
  and falls with none of them — asserted by monotonicity tests.
- Mastery never moves more than the documented maximum from a single attempt.
- Every returned `reason` is non-empty and references the factors that decided it.
