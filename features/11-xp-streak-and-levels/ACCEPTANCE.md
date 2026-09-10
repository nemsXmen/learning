# Acceptance criteria

- [x] XP is an append-only ledger and the user row holds no XP counter
- [x] The unique constraint provably prevents farming by repetition
- [x] Improved-score awards grant only the delta
- [x] Level is derived from one documented table
- [x] Streak respects the user's timezone and increments once per day
- [x] Achievement detection cannot affect learning state - it is synchronous rather
      than queued; the amendment and its reason are in docs/decisions.md
- [ ] Empty, loading, error, success and already-earned states implemented - no UI
      yet; XP, streak and achievements surface on the dashboard and profile (slice 13)
- [ ] Motion respects `prefers-reduced-motion`; values are text-accessible - no UI yet
- [x] Tone matches CDC §78; open questions on the curve recorded in `docs/decisions.md`
- [x] Automated tests pass
