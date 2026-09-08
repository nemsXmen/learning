# UX specification

## User flow

No user-facing flow. The deliverable is an app shell: root layout, theme tokens
(light and dark per CDC §60), typography scale and a 404 page.

## States

- loading: the root layout renders a neutral shell with no layout shift.
- error: a global error boundary renders a recoverable message, never a stack trace.
- empty / success / disabled: not applicable in this slice.

## Responsive and accessibility requirements

- Theme respects `prefers-color-scheme` and `prefers-reduced-motion`.
- Base contrast meets WCAG AA in both themes; focus ring is visible on every focusable.
- Layout has no horizontal scroll from 320px upward.
