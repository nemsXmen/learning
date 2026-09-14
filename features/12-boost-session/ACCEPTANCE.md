# Acceptance criteria

- [x] Plans come from `packages/learning-engine` and are stored, not recomputed
- [x] Sessions respect the chosen duration and target explained weak or due skills
- [x] Steps run in order, are resumable, and reuse the quiz feedback shape
- [x] Completion applies mastery and XP exactly once and shows per-skill deltas
- [x] The unavailable case is a first-class state with a next action, not an error
- [x] Loading, empty, error, success, disabled and expired states implemented
- [x] Fully keyboard operable; step progress announced; reduced motion respected -
      `pnpm test:a11y` plays a whole session by keyboard (duration, every step, result),
      reads the step counter from its aria-live region and scans a running step with axe
      in both themes; the duration radios now draw focus on their label. Reduced motion
      comes from the global token rule, checked on the landing and dashboard
- [x] Automated tests pass
