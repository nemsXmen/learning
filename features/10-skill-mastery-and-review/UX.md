# UX specification

## User flow

Surfaces inside other features: the quiz result screen (mastery deltas, CDC §80), the
progress page (weak areas, CDC §79) and the dashboard boost card (CDC §20).

## States

- success: a delta is shown as `Event Loop +7%` with the skill name, never a bare number.
- empty: a learner with no attempts sees "no mastery data yet" and a first action, not
  a zeroed chart implying failure.
- error: a mastery read failure degrades to hiding the panel, never blocking the page.
- loading / disabled: owned by consuming features.

## Responsive and accessibility requirements

Mastery bars carry a text value and an accessible name; `dueNow` is conveyed by text
as well as by colour.
