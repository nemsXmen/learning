# Acceptance criteria

- [x] Chapter renders server-side with highlighted code and a working outline
- [x] Sidebar reflects real per-chapter status and is usable on mobile
- [x] Reading progress and explicit completion both persist and never regress
- [x] Locked chapters are refused server-side with an explanatory page
- [ ] Loading, empty, error, success and locked states implemented - locked, error
      and success are done; no loading.tsx for the chapter route yet
- [x] Axe passes; keyboard-only journey works; AA contrast in both themes - no
      violation in either theme, focus visible at every tab stop, and the chapter
      test or completion reached by keyboard (`pnpm test:a11y`)
- [x] No client-side Markdown parsing and no answer key in the payload
- [x] Automated tests pass
