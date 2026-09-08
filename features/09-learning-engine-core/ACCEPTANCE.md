# Acceptance criteria

- [ ] Package has no I/O, no clock access and no framework dependency, enforced by lint
- [ ] Every coefficient lives in `parameters.ts` and is documented
- [ ] Every listed function is implemented, typed and unit tested
- [ ] Determinism, monotonicity and range invariants are asserted by tests
- [ ] Boost plans respect the time budget and the 5–15 minute target
- [ ] Every output carries a non-empty, user-presentable `reason`
- [ ] Trajectory fixtures pass and are readable as a specification
- [ ] Coverage threshold met; open questions on coefficients recorded in `docs/decisions.md`
