# Acceptance criteria

- [x] Plans come from `packages/learning-engine` and are stored, not recomputed
- [x] Sessions respect the chosen duration and target explained weak or due skills
- [x] Steps run in order, are resumable, and reuse the quiz feedback shape
- [x] Completion applies mastery and XP exactly once and shows per-skill deltas
- [x] The unavailable case is a first-class state with a next action, not an error
- [x] Loading, empty, error, success, disabled and expired states implemented
- [ ] Fully keyboard operable; step progress announced; reduced motion respected -
      the start screen passes axe in both themes and its primary action is reached
      by keyboard; the running session (steps, aria-live counter) is not exercised
      by `pnpm test:a11y` yet
- [x] Automated tests pass
