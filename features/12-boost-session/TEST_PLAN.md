# Test plan

## Unit

- Plan mapping: engine steps become renderable steps with stable refs.
- Duration fitting: a 5-minute budget never yields a 9-minute plan.
- Step ordering guard.

## Integration

- Preview reports `available: false` with a reason when nothing is weak or due.
- Session creation stores the plan and the reason; the plan is stable across re-reads.
- Out-of-order step submission → 409; foreign session → 404; expired → 410.
- Completion applies mastery and XP exactly once, even on a duplicate call.
- `boost.session.completed` carries accurate per-skill outcomes.

## End to end

- Fail a quiz, open the dashboard boost card, run the full session, see the deltas, and
  see mastery updated on the progress page.
- Reload mid-session and resume at the same step.

## Edge cases and regression risks

- A weak skill with too few questions to fill the budget.
- All target skills mastered between preview and creation.
- Two sessions started in two tabs.
