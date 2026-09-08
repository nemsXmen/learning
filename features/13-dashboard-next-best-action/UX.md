# UX specification

## User flow

Sign in → `/dashboard` → one primary action (Continue, or Boost when a review is
overdue) → the learning surface → return to the dashboard with the state updated.

## States

- loading: streamed — greeting and streak first, then cards; skeletons match final size.
- empty: a brand-new learner sees an onboarding dashboard — choose a technology, start
  the first chapter — not zeroed statistics.
- error: a degraded panel is hidden with a quiet retry; the primary action never
  disappears. A total failure shows a retryable full-page state.
- success: the primary action is visually dominant; secondary actions are quieter.
- disabled / permission denied: nothing due and nothing in progress → the next chapter
  becomes the primary action; the boost card explains why it is empty.

## Layout (CDC §20, §23)

Header (greeting, streak, XP, level, overall progress) → Continue card → Boost card →
Today's plan → technology progress. Generous spacing, cards, restrained colour, no
ERP-style density.

## Responsive and accessibility requirements

- One column on mobile with the primary action above the fold; two then three columns up.
- Landmarks (`header`, `main`, `nav`), one `h1`, logical heading order.
- Progress rings are `aria-hidden` with a text equivalent beside them.
- AA contrast in both themes; reduced motion honoured; full keyboard path to every card.
- `noindex` on `/dashboard`, `/learn`, `/boost`, `/profile` (CDC §61).
