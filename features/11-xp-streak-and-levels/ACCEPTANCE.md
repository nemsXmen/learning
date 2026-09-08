# Acceptance criteria

- [ ] XP is an append-only ledger and the user row holds no XP counter
- [ ] The unique constraint provably prevents farming by repetition
- [ ] Improved-score awards grant only the delta
- [ ] Level is derived from one documented table
- [ ] Streak respects the user's timezone and increments once per day
- [ ] Achievement detection is asynchronous and cannot affect learning state
- [ ] Empty, loading, error, success and already-earned states implemented
- [ ] Motion respects `prefers-reduced-motion`; values are text-accessible
- [ ] Tone matches CDC §78; open questions on the curve recorded in `docs/decisions.md`
- [ ] Automated tests pass
