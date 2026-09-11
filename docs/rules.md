# Technical and product rules

Every rule below traces to the CDC or to an accepted entry in
[decisions.md](./decisions.md). Nothing here is an unsourced preference.

## Content

1. Markdown in `content/` is the source of truth for knowledge; PostgreSQL stores user
   state and a catalog mirror only. — CDC §41, §42, §89.5–§89.7
2. Every chapter declares frontmatter and at least one skill. — CDC §7, §89.8
3. Every quiz question carries an `explanation`. — CDC §76
4. Invalid content fails CI. — CDC §44
5. Adding a technology is a content change, not a code change. — CDC §89.28

## Learning

6. Progression is skill-based, not chapter-based. — CDC §27, §89.9
7. `packages/learning-engine` is pure: no I/O, no clock, no framework types. — CDC §64, §89.10
8. V1 recommendations are deterministic and rule-based; no generative AI in the loop. — CDC §67, §89.11–§89.12
9. Every recommendation carries a human-readable `reason`. — CDC §66, §89.13
10. Every wrong answer produces feedback: the given answer, the correct answer, why,
    and what to review. — CDC §76, §89.14
11. Every screen with state answers "what should I do next". — CDC §81, §89.15
12. The engine is exhaustively unit tested: mastery, review, recommendation, XP, streak,
    prerequisites, boost generation. — CDC §73, §89.24

## Gamification

13. XP is an append-only ledger, never a counter on the user row. — CDC §52
14. The same effort is never paid twice; re-reading earns nothing. — CDC §26
15. Gamification stays secondary to learning, and messages stay credible. — CDC §25, §78

## Backend

16. TypeORM, never Prisma. — CDC §38, §89.4
17. Migrations only; `synchronize` is off everywhere. — decisions.md
18. Modules stay independent; no module writes another module's tables. — CDC §45
19. Grading, mastery, review scheduling and XP are synchronous; achievements, analytics,
    reminders and indexing go through BullMQ. — decisions.md
20. Zod validates at every boundary, including content. — CDC §89.18
21. Derived state is rebuildable, and a rebuild reads **every** fact that produced
    it. A rebuild that silently misses a source overwrites correct state with an
    incomplete one, so the grading of each source lives in one place shared by the
    live path and the replay. — features/10 CONTRACT.md

## Frontend

22. The browser talks only to Next.js; the NestJS API is never called from the client. — CDC §37, §89.21–§89.22
23. Server Components by default; TanStack Query for client server-state; React Hook
    Form + Zod for forms; nuqs for URL state. — CDC §37, §89.16–§89.20
24. Every feature implements loading, empty, error, success, disabled and permission
    states. — CDC §85, §89.27
25. Keyboard navigation, visible focus, contrast, labels, screen-reader support and
    reduced motion are requirements, not polish. — CDC §58
26. Responsive down to mobile; desktop is prioritised for code reading. — CDC §59
27. Dark mode is first-class and uses a restrained palette. — CDC §60
28. Public pages are indexable; `/dashboard`, `/learn`, `/boost`, `/profile` are not. — CDC §61

## Security

29. Secrets are server-side only; no credential in a `NEXT_PUBLIC_*` variable. — CDC §37, §48
30. Answer keys and unearned explanations never leave the API. — CDC §9, §76
31. A user id is taken from the authenticated token, never from a request body. — CDC §48
32. No user-supplied code executes in V1; a future sandbox is isolated and resource
    limited. — CDC §56, §57
33. Email tokens are stored hashed, single use and time limited; the plaintext exists
    only in the emailed link. — decisions.md
34. Password reset and resend-verification never reveal whether an address has an
    account. — CDC §48
35. A mail failure never fails the action that triggered it. How it is sent depends on
    `MAIL_DRIVER`: `queue` (retries, nothing blocks) where a worker can run, `inline`
    (awaited, bounded retries) where none can. — decisions.md

## Code shape

36. Small, single-responsibility files; no `mega-service.ts` or thousand-line component. — CDC §45, §46, §83
37. Every feature ships implementation, types, validation, error handling, tests and
    documentation together. — CDC §84
38. A feature is done only against the eleven-point checklist. — CDC §85
39. A contract change updates the feature pack and the architecture docs in the same
    change. — SCAFFOLD_PROMPT_AGENTS.md
