# Requirements

## Goal

Chapter progress is recorded accurately, idempotently and cheaply, and is the single
place any other module asks "where is this user".

## Scope

### Must

- `user_progress` write path: start, update percentage and time, complete.
- Idempotent completion: completing twice does not double-count anything downstream.
- Time-spent accounting bounded per report and per day so an idle tab cannot inflate it.
- `learning_session` records with mode, so analytics and streaks have a source.
- Read API for one chapter and for a user's progress across a technology.
- Emits a `chapter.completed` event for XP and achievements (slice 11).

### Must not

- No XP awarding here; this module reports facts, slice 11 decides rewards.
- No mastery computation; that is slice 10.
- No status transition triggered by anything except an explicit call.
