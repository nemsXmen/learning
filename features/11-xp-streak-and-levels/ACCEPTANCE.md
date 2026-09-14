# Acceptance criteria

- [x] XP is an append-only ledger and the user row holds no XP counter
- [x] The unique constraint provably prevents farming by repetition
- [x] Improved-score awards grant only the delta
- [x] Level is derived from one documented table
- [x] Streak respects the user's timezone and increments once per day
- [x] Achievement detection cannot affect learning state - it is synchronous rather
      than queued; the amendment and its reason are in docs/decisions.md
- [x] Empty, loading, error, success and already-earned states implemented - XP, level
      and streak live on the dashboard: zero reads as "0 XP · Niveau 1", it has a
      loading.tsx, a failed source drops its panel, and a retaken quiz that repeats its
      best score says "Pas d'XP cette fois" instead of staying silent. Achievements
      have no screen yet — deferred in docs/roadmap.md
- [x] Motion respects `prefers-reduced-motion`; values are text-accessible - XP, level
      and streak show on the dashboard as text, the progress ring carries a text value
      and label, and `pnpm test:a11y` checks nothing there moves once reduced motion
      is requested
- [x] Tone matches CDC §78; open questions on the curve recorded in `docs/decisions.md`
- [x] Automated tests pass
