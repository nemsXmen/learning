# Acceptance criteria

- [ ] Progress endpoints match the contract and are user-scoped by token
- [ ] Percentage is monotonic and status only moves forward
- [ ] Completion is idempotent and emits `chapter.completed` exactly once
- [ ] Time spent is clamped per report and per day
- [ ] Locked and unknown chapters return the documented errors
- [ ] Concurrency test proves no double completion
- [ ] Automated tests pass
