# Acceptance criteria

- [x] Chapter renders server-side with highlighted code and a working outline
- [x] Sidebar reflects real per-chapter status and is usable on mobile
- [x] Reading progress and explicit completion both persist and never regress
- [x] Locked chapters are refused server-side with an explanatory page
- [x] Loading, empty, error, success and locked states implemented - the chapter route
      has its own loading.tsx, shaped like the chapter; before it, opening a chapter
      flashed the technology page's list of cards
- [x] Axe passes; keyboard-only journey works; AA contrast in both themes - no
      violation in either theme, focus visible at every tab stop, and the chapter
      test or completion reached by keyboard (`pnpm test:a11y`)
- [x] Exercises and interview questions offer ordered hints and a solution, by keyboard -
      every item of the five chapters carries them (`content:validate` refuses one that
      does not); `pnpm test:a11y` opens a hint by keyboard, checks the next one appears
      only then, reaches « Je ne sais pas », and scans the chapter with every block open
- [x] No client-side Markdown parsing and no answer key in the payload
- [x] Automated tests pass
