# UX specification

## Visual direction

Dark-first, developer-premium. Background `#0B1020`, surface `#111827`, border
`#1F2937` (CDC §60), indigo-violet accent. Restrained palette: one accent, one success,
one warning, one danger, one streak colour — no gradients beyond a single subtle
accent wash. Generous spacing, cards, excellent typography, premium code blocks
(CDC §23). Between technical documentation and Notion, never an ERP dashboard.

Light theme is derived from the same tokens and must be equally usable, not an
afterthought.

## User flow

The shell is the constant: header with streak, XP and level; navigation to Dashboard,
Learn, Boost, Practice, Profile; content area. Every screen has exactly one visually
dominant primary action (CDC §81).

## States

Each is a named component, so features do not reinvent them:

- loading: `Skeleton` matching the final element's dimensions — no layout shift.
- empty: `EmptyState` with an explanation and one action, never a zeroed chart that
  reads as failure.
- error: `ErrorState` with a plain message and a retry, never a stack trace.
- success: feedback near its source, brief, credible in tone (CDC §78).
- disabled / permission denied: always paired with a visible reason.

## Motion (CDC §55)

Only: progress transitions, XP gain, achievement unlock, chapter completion, answer
feedback, streak update. Durations from tokens, 150–300ms. Everything suppressed under
`prefers-reduced-motion`, with the end state still applied.

## Responsive and accessibility requirements

- Breakpoints: mobile ≤640, tablet ≤1024, desktop above. Desktop is prioritised for
  reading code (CDC §59).
- AA contrast in both themes, for prose and for code blocks.
- Keyboard: full path, visible focus, skip link, modal and drawer trap and restore
  focus, `Escape` closes.
- Status is never conveyed by colour alone; icons and text accompany it.
