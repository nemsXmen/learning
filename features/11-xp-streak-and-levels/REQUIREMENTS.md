# Requirements

## Goal

Effort is rewarded once, visibly and honestly, and a learner can see exactly where
every point came from.

## Scope

### Must

- `xp_transaction` append-only ledger with a uniqueness constraint on
  `(user_id, reason, reference_type, reference_id)` — the anti-farming mechanism.
- Award XP on: first chapter read, quiz, exercise, chapter test, boost, project, and an
  improved score on a repeated attempt (CDC §25, §26).
- Level derived from total XP through a single monotonic table.
- Streak updated by the engine using the user's timezone; `streak` row holds current,
  longest and last active date.
- Achievement definitions and `user_achievement` unlocking, detected asynchronously via
  BullMQ (the only queue consumer in V1).
- Read APIs: XP summary, XP history, streak, achievements.

### Must not

- No mutable XP counter on the user row.
- No XP for re-reading, re-taking without improvement, or passive page views.
- No blocking of the learning path on achievement processing.
