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

## Invariants

- Mastery and confidence stay within 0–100.
- Every mastery row change is attributable to exactly one attempt or completion.
- `next_review_at` is always set when mastery is below the mastery threshold.
- Replaying history reproduces the current state exactly for unchanged parameters.
