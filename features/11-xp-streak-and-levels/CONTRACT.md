# Contract

## Inputs and outputs

`GET /me/xp` → `200 { total, level, levelProgressPercent, xpToNextLevel, todayXp }`

`GET /me/xp/history?limit=50` → `200 [{ amount, reason, referenceType, referenceId,
createdAt }]`

`GET /me/streak` → `200 { currentDays, longestDays, lastActiveDate, activeToday,
timezone }`

`GET /me/achievements` → `200 [{ code, title, description, icon, unlockedAt|null }]`

## API or event boundary

Consumes `chapter.completed`, `quiz.attempt.graded`, `boost.session.completed`.
Emits `xp.awarded { userId, amount, reason, referenceType, referenceId, totalAfter,
levelAfter }` and enqueues `achievements.detect`.

## Validation and errors

- A duplicate award is a no-op returning the existing transaction, not an error.
- An improved-score award grants only the documented delta, never the full amount again.
- Reads are token-scoped; `401` unauthenticated.

## Invariants

- Total XP always equals the sum of the ledger; no other source of truth exists.
- The same `(reason, referenceType, referenceId)` is never paid twice for a user.
- Level is a pure function of total XP.
- Streak increments at most once per user per local calendar day.
- Achievement detection failure never affects XP, mastery or progress.
