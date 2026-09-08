# Data model

PostgreSQL holds **user state**. `content/` holds **knowledge**. A row in this
database never stores lesson prose (CDC §42, §89.7).

## Ownership rule

| Entity group | Written by | Read by |
| --- | --- | --- |
| Catalog mirror (`technology`, `module`, `chapter`, `skill`, `skill_prerequisite`, `chapter_skill`) | `content:sync` only | everything |
| Identity (`user`, `refresh_token`, `email_token`) | auth module | auth module |
| Learning state (`user_progress`, `skill_mastery`, `quiz_attempt`, `attempt_answer`, `review_item`) | learning modules | engine callers |
| Gamification (`xp_transaction`, `streak`, `achievement`, `user_achievement`) | gamification module | dashboard, profile |
| Sessions (`learning_session`, `boost_session`) | boost module | dashboard |

No module writes another module's tables. Cross-module reads go through the owning
service, not through a foreign repository.

## Catalog mirror

Projected from `content/` by `content:sync`; safe to drop and rebuild.

```text
technology        id, slug, name, order, is_published
module            id, technology_id, slug, title, order
chapter           id (content id), module_id, slug, title, level, order,
                  content_path, content_version, estimated_minutes, difficulty, xp
skill             id (content id), technology_id, slug, name, importance
skill_prerequisite  skill_id, requires_skill_id           (the skill graph, CDC §28)
chapter_skill       chapter_id, skill_id, weight          (a chapter teaches N skills, CDC §27)
chapter_prerequisite chapter_id, requires_chapter_id
quiz              id, chapter_id, kind (QUIZ | CHAPTER_TEST), content_path, content_version
```

`content_version` is the content hash for the file. It invalidates the render cache
and lets an attempt state which version it was graded against.

Question definitions are **not** mirrored: they are read from `content/` at grading
time so an answer key never sits in a table the API serializes by accident.

## Identity

```text
user              id, email (citext unique), password_hash, display_name, timezone,
                  goal, daily_minutes_target, email_verified_at, created_at
refresh_token     id, user_id, token_hash, expires_at, revoked_at, replaced_by_id,
                  user_agent, ip_hash
email_token       id, user_id, purpose (VERIFY_EMAIL | RESET_PASSWORD), token_hash,
                  expires_at, consumed_at, created_at
```

`email_token` stores only a hash: the plaintext token exists in the emailed link and
nowhere else, so a database read cannot take over an account. Issuing a new token for a
purpose invalidates the user's outstanding ones for that purpose.

## Learning state

```text
user_progress     user_id, chapter_id, status (NOT_STARTED | IN_PROGRESS | COMPLETED),
                  progress_percent, time_spent_seconds, last_accessed_at, completed_at
                  PK (user_id, chapter_id)                                    CDC §50

skill_mastery     user_id, skill_id, mastery_score, confidence_score,
                  success_count, failure_count, difficulty_level,
                  last_attempt_at, last_reviewed_at, next_review_at, review_count
                  PK (user_id, skill_id)                                      CDC §51

quiz_attempt      id, user_id, quiz_id, content_version, started_at, submitted_at,
                  score_percent, passed, source (CHAPTER | BOOST | ASSESSMENT | REVIEW)
attempt_answer    id, attempt_id, question_id, given, is_correct, time_spent_ms
review_item       id, user_id, skill_id, due_at, interval_days, ease, last_result,
                  source_attempt_id                                           CDC §16
```

`skill_mastery` is the engine's working memory; `review_item` is its schedule. Both
are recomputed from `quiz_attempt` history, so a formula change can be replayed.

## Gamification

```text
xp_transaction    id, user_id, amount, reason, reference_type, reference_id, created_at
                  UNIQUE (user_id, reason, reference_type, reference_id)       CDC §52, §26
streak            user_id (PK), current_days, longest_days, last_active_date, timezone
achievement       id, code, title, description, icon
user_achievement  user_id, achievement_id, unlocked_at   PK (user_id, achievement_id)
```

XP is never a mutable counter on `user`. The unique constraint is what makes
re-reading a chapter worth zero (CDC §26) — the second insert simply conflicts.

## Sessions

```text
learning_session  id, user_id, started_at, ended_at, mode (LEARN | PRACTICE | REVIEW |
                  BOOST | CHALLENGE | INTERVIEW | PROJECT), chapter_id?, duration_seconds
boost_session     id, user_id, learning_session_id, target_skill_ids[], plan (jsonb),
                  status, score_percent, mastery_delta (jsonb), created_at   CDC §17
```

`plan` and `mastery_delta` are JSONB because a boost plan is an engine output, not a
relational entity; it is written once and read back whole.

## Indexes that matter

- `user_progress (user_id, status)` — dashboard continue card.
- `skill_mastery (user_id, next_review_at)` — due-review lookup, the hottest engine read.
- `quiz_attempt (user_id, submitted_at desc)` — history windows for the engine.
- `xp_transaction (user_id, created_at desc)` — profile and daily totals.

## Rules

- Migrations only; `synchronize` is off everywhere.
- Timestamps are `timestamptz`, stored UTC; the user's timezone lives on the profile
  and is applied only when computing calendar days (streaks).
- Deleting a user cascades their state; catalog rows are never user-scoped.
