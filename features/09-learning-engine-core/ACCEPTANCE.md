# Acceptance criteria

- [x] Package has no I/O, no clock access and no framework dependency, enforced by lint
- [x] Every coefficient lives in `parameters.ts` and is documented
- [x] Every listed function is implemented, typed and unit tested
- [x] Determinism, monotonicity and range invariants are asserted by tests
- [x] Boost plans respect the time budget and the 5–15 minute target
- [x] Every output carries a non-empty, user-presentable `reason`
- [x] Trajectory fixtures pass and are readable as a specification - `trajectory.test.ts`
      follows one learner over days: reading, three perfect tests to unlock, mastery at
      the fourth, the review ladder, failures and forgetting. Its numbers match what the
      live stack showed (8.8 → 33.8 → 58.8 → 72.4 %)
- [x] Coverage threshold met; open questions on coefficients recorded in `docs/decisions.md`
