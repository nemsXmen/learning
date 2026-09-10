# Acceptance criteria

- [x] Progress endpoints match the contract and are user-scoped by token
- [x] Percentage is monotonic and status only moves forward
- [x] Completion is idempotent and emits `chapter.completed` exactly once
- [x] Time spent is clamped per report and per day
- [x] Locked and unknown chapters return the documented errors
- [x] Concurrency test proves no double completion
- [x] Automated tests pass

## Deliberately not built here

`learning_session` is listed under Must in REQUIREMENTS.md and is **not**
implemented. Its shape is genuinely undecided: slice 11 needs "did this learner do
something today", which the XP ledger answers more directly, and slice 12 creates
boost sessions with a real start/end lifecycle. Inventing a third shape now would
give those slices something to contradict. **Decided with slice 11**: the XP
ledger is the activity record, and no `learning_session` table is created — see
docs/decisions.md.
