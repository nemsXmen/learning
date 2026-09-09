# Acceptance criteria

- [x] Package has no I/O, no clock access and no framework dependency, enforced by lint
- [x] Every coefficient lives in `parameters.ts` and is documented
- [x] Every listed function is implemented, typed and unit tested
- [x] Determinism, monotonicity and range invariants are asserted by tests
- [x] Boost plans respect the time budget and the 5–15 minute target
- [x] Every output carries a non-empty, user-presentable `reason`
- [ ] Trajectory fixtures pass and are readable as a specification - per-function
      tests cover the behaviour; a multi-day replay fixture is not written yet
- [x] Coverage threshold met; open questions on coefficients recorded in `docs/decisions.md`
