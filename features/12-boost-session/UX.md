# UX specification

## User flow

Dashboard boost card or `/boost` → see target skills with reasons and pick a duration →
start → one step per screen with a step counter and remaining time → completion screen
with per-skill deltas → primary action: continue learning, or boost again.

## States

- loading: the entry card shows a skeleton; generation failure never blanks `/boost`.
- empty: nothing weak or due → "Rien à renforcer pour l'instant" with the next chapter
  as the action (CDC §81 — always one clear next action).
- error: a step submission failure keeps the answer and retries; the session is resumable
  after a reload or a closed tab.
- success: `Event Loop +7%`, `Microtasks +9%` (CDC §80), then one primary action.
- disabled / permission denied: duration options unavailable for the current plan are
  disabled with a reason; an expired session offers to generate a new one.

## Responsive and accessibility requirements

- Full-screen focused layout on mobile, centred card on desktop; one step per screen.
- Step progress is announced (`Question 2 sur 5`) and reflected in the document title.
- Timing is informational only — the session is never failed by a timer.
- Keyboard operable throughout; result announced with `aria-live=polite`.
- Delta animations respect `prefers-reduced-motion`; values remain readable as text.
