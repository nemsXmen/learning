# UX specification

## User flow

XP and streak appear on the dashboard header (CDC §20) and the profile (CDC §33);
history is on the profile. A gain animates briefly at the moment it is earned.

## States

- loading: header reserves the space so the layout does not jump when values arrive.
- empty: a new account shows `0 XP · Level 1 · no streak yet` with an inviting first
  action, not an empty state that reads as failure.
- error: a failed gamification read hides the panel; the learning surface is unaffected.
- success: `+40 XP` rises briefly near its source; the streak flame updates once per day.
- disabled: a repeat action that earns nothing says so plainly ("already earned") rather
  than silently awarding zero.

## Tone (CDC §78)

Credible and specific: "Tu es à 2 chapitres de terminer JavaScript Async" — never
"🔥🔥🔥 TU ES INCROYABLE !!!".

## Responsive and accessibility requirements

- XP and streak are text first; the flame and rings are decorative and `aria-hidden`.
- Gain animations are suppressed under `prefers-reduced-motion`; the value still updates.
- Achievement cards state locked or unlocked in text, not by opacity alone.
