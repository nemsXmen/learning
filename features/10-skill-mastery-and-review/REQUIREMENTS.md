# Requirements

## Goal

The platform knows what each learner actually masters, and when each skill is due for
review — the basis for every recommendation.

## Scope

### Must

- Consume `quiz.attempt.graded` synchronously and update `skill_mastery` and
  `review_item` in the same transaction as the attempt.
- Persist the engine's `reason` alongside the change so a mastery move is explainable
  after the fact.
- Read APIs: mastery per technology, weak skills, due reviews.
- A replay command that recomputes mastery from attempt history, so a parameter change
  can be applied without losing data.
- Chapter completion also contributes to mastery for the chapter's skills, weighted
  lower than a graded attempt.

### Must not

- No formula in this module — every calculation delegates to `packages/learning-engine`.
- No background job on the write path; recomputation from history is the only async part.
- No mastery contribution from ungraded question types.
