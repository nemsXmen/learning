# Contract

## Inputs and outputs

`PUT /me/progress/chapters/:chapterId` ← `{ progressPercent?, timeSpentSeconds? }`
→ `200 { chapterId, status, progressPercent, timeSpentSeconds, lastAccessedAt }`

`POST /me/progress/chapters/:chapterId/complete` → `200 { chapterId, status:"COMPLETED",
completedAt, alreadyCompleted: boolean }`

`GET /me/progress/technologies/:slug` → `200 { technologySlug, progressPercent,
chapters: [{ chapterId, status, progressPercent, completedAt }] }`

## API or event boundary

Emits `chapter.completed { userId, chapterId, technologySlug, skillIds, xp,
occurredAt }` on the first completion only.

## Validation and errors

- `progressPercent` integer 0–100; `timeSpentSeconds` 0–`MAX_REPORT_SECONDS`, clamped
  server-side with the clamp recorded.
- Unknown chapter → `404 CHAPTER_NOT_FOUND`; locked chapter → `403 CHAPTER_LOCKED`.
- Unauthenticated → `401`. The user id always comes from the token.

## Invariants

- Status only moves forward: `NOT_STARTED → IN_PROGRESS → COMPLETED`.
- `progressPercent` is monotonic non-decreasing.
- Completion sets `progressPercent = 100` and `completedAt` exactly once;
  `chapter.completed` is emitted exactly once per user and chapter.
- Daily accumulated `timeSpentSeconds` per user is capped.
