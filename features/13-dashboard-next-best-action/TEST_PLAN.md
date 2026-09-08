# Test plan

## Unit

- Today's plan fits the daily minutes target and prefers overdue reviews.
- Next best action falls back correctly: overdue review → in-progress chapter → next
  unlocked chapter → all-caught-up state.
- Degraded-panel assembly returns `null` plus the panel name rather than throwing.

## Integration

- Dashboard aggregation is one round trip and matches the contract for a mixed-state user.
- A new user receives the onboarding shape with a valid `nextBestAction`.
- With mastery service unavailable, the response is degraded but still has an action.

## End to end

- New account: register → dashboard shows onboarding → start a chapter.
- Active account: fail a quiz → dashboard surfaces the weak skill with its reason and a
  boost action → run it → dashboard reflects the new mastery and XP.
- Axe passes in both themes; keyboard-only path to the primary action.
- `robots` meta asserts `noindex` on private routes.

## Edge cases and regression risks

- A user with everything mastered.
- A user with a daily target smaller than the shortest available action.
- Streak visible but not yet active today.
