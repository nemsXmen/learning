# Acceptance criteria

- [x] Plans come from `packages/learning-engine` and are stored, not recomputed
- [x] Sessions respect the chosen duration and target explained weak or due skills
- [x] Steps run in order, are resumable, and reuse the quiz feedback shape
- [x] Completion applies mastery and XP exactly once and shows per-skill deltas
- [x] The unavailable case is a first-class state with a next action, not an error
- [ ] Loading, empty, error, success, disabled and expired states implemented - the
      API returns each of them; no /boost pages yet
- [ ] Fully keyboard operable; step progress announced; reduced motion respected -
      no UI yet
- [x] Automated tests pass
