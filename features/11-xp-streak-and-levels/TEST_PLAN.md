# Test plan

## Unit

- Level from total XP: boundaries, level 1, level 50, and beyond the table's end.
- Improved-score award computes the delta only.
- Streak: consecutive days, missed day reset, same-day repeat, timezone boundary, DST.

## Integration

- Completing a chapter twice inserts one transaction; the second returns the first.
- Concurrent identical awards violate the unique constraint and are handled as a no-op.
- Total XP equals the ledger sum after a mixed sequence of events.
- Achievement detection job failure leaves XP and mastery intact.

## End to end

- Complete a chapter, see XP rise on the dashboard; re-read it and see no change.
- Two consecutive local days of activity show a streak of 2.

## Edge cases and regression risks

- A user changing timezone with an active streak.
- Backdated events arriving out of order from the queue.
- A very large history page performing acceptably.
