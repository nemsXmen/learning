# UX specification

## User flow

Chapter → "Take the quiz" → one question per screen with a progress indicator →
submit → result screen with per-question feedback → primary action: retry the failed
skills, or continue (CDC §81).

## States

- loading: question skeleton; the submit control is disabled until the question loads.
- empty: a chapter without a quiz shows an explanatory card, not a broken screen.
- error: a submit failure keeps the answers in memory and offers a retry — answers are
  never lost by a network error.
- success: score, per-question breakdown, and mastery deltas once slice 10 is live.
- disabled / permission denied: submit disabled until every question has an answer, with
  the reason stated; an expired attempt offers to start a new one.

## Feedback rule (CDC §76)

Never `❌ Incorrect` alone. Always: your answer · correct answer · why · what to review,
then the actions Retry, See the explanation, Add to Boost.

## Responsive and accessibility requirements

- Options are radio or checkbox groups in a `fieldset` with a `legend`, fully keyboard
  operable, number keys as a shortcut.
- Correctness is conveyed by icon and text, never colour alone.
- The result is announced with `aria-live=polite`; focus moves to the result heading.
- Code inside a question is highlighted server-side and scrolls within its block.
