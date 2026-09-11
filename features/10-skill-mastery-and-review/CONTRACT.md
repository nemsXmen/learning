# Contract

## Inputs and outputs

`GET /me/mastery/technologies/:slug` → 200
```json
{ "technologySlug": "javascript", "averageMastery": 68,
  "skills": [{ "skillId": "event-loop", "name": "Event Loop", "mastery": 43,
               "confidence": 51, "nextReviewAt": "2026-09-12T08:00:00Z",
               "dueNow": true, "band": "high" }] }
```

`GET /me/mastery/weak?limit=3` → the highest-priority weak skills with each `reason`
(CDC §20 dashboard boost card).

`GET /me/reviews/due` → skills due now, ordered by priority, with estimated minutes.

## API or event boundary

Consumes `quiz.attempt.graded` (slice 08) and `chapter.completed` (slice 07).
Emits `mastery.updated { userId, changes: [{ skillId, from, to, reason }], occurredAt }`
for dashboards and achievements.

## Validation and errors

- An event for an unknown skill is logged and skipped, never fatal to the attempt.
- Replay is idempotent and refuses to run against a technology mid-sync.
- All reads are token-scoped; `401` unauthenticated, `404` unknown technology.

## Deviations from the pack, and why

- **`review_item` is not created.** `skill_mastery` already carries the schedule
  (`next_review_at`, `interval_days`, `review_count`). A second table holding the
  same schedule is a second source of truth waiting to drift. The audit the pack
  wanted from it is served better by `mastery_change`, which records every move
  with the engine's reason and the attempt or completion that caused it.
- **Listeners run inside the request, not inside the attempt's transaction.**
  Wrapping both would mean threading a transaction manager through the event bus.
  The attempt is the fact; mastery is derived from it. A listener that fails is
  logged and skipped, and `mastery:replay` rebuilds the state from attempt
  history — which is why that command exists.

## What `mastery:replay` folds

Three kinds of stored fact move mastery, and the replay reads all three. Missing
one does not fail loudly — it rebuilds a learner as if part of their work never
happened, and the rebuild overwrites the correct state:

| Fact | Table | Read as |
| --- | --- | --- |
| Chapter completion | `user_progress` (`status = 'COMPLETED'`) | the chapter's skills |
| Quiz attempt | `quiz_attempt` + `attempt_answer` | per-skill tally from the answers |
| Boost session | `boost_session` (`status = 'COMPLETED'`) | per-skill tally from `plan.steps` × `answers` |

A Boost session never writes a `quiz_attempt` row: it is graded from its own plan
and answers, and emits the event directly. Its grading therefore lives in
`boost/boost-outcomes.ts`, imported by both `BoostService` and the replay, so the
live path and the rebuild cannot drift apart.

## Invariants

- Mastery and confidence stay within 0–100.
- Every mastery row change is attributable to exactly one attempt or completion.
- `next_review_at` is always set when mastery is below the mastery threshold.
- Replaying history reproduces the current state exactly for unchanged parameters.
