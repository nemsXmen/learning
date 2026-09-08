# UX specification

## User flow

`/learn` → technology card → `/learn/[technology]` → roadmap and module list →
chapter card → `/learn/[technology]/[chapter]`. The primary action on the technology
page is "Continue" pointing at the resumable chapter.

## States

- loading: skeleton cards matching final dimensions; no layout shift.
- empty: no technology started yet → an explanatory card with a single start action.
- error: retryable message; a failed technology detail does not blank `/learn`.
- success: progress rings and bars animate once, respecting reduced motion.
- disabled / permission denied: a locked chapter is visibly locked, not clickable to
  content, and states which skills unlock it and at what mastery.

## Responsive and accessibility requirements

- Grid: 1 column on mobile, 2 on tablet, 3 on desktop.
- The roadmap is a semantic ordered list first, a visual sequence second, and is
  readable by a screen reader without the graphics.
- Progress is conveyed by text as well as colour; every card is keyboard reachable with
  a visible focus ring; lock state is announced, not colour-only.
