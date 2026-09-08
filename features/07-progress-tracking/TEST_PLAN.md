# Test plan

## Unit

- Monotonic percentage: a lower report is ignored, not written.
- Status transition table, including illegal backwards transitions.
- Time clamping per report and per day.

## Integration

- First completion emits one event; the second returns `alreadyCompleted: true` and
  emits nothing.
- Concurrent completion requests produce exactly one event (transactional guard).
- Locked chapter progress is refused.
- Technology progress read matches the sum of chapter rows.

## End to end

- Read and complete a chapter, then verify the catalog and dashboard reflect it.

## Edge cases and regression risks

- Two devices reporting different percentages simultaneously.
- A chapter removed by content sync while progress exists.
- Clock skew on `lastAccessedAt`.
