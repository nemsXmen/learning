# UX specification

## User flow

`/register` → goal and daily-time step (CDC §34) → `/dashboard`, with a dismissible
"verify your email" banner until the address is confirmed.
`/login` → `next` destination or `/dashboard`.
`/verify-email?token=…` → confirmation, then straight to the dashboard.
`/forgot-password` → "if an account exists, we sent a link" → `/reset-password?token=…`
→ password set → `/login` with a success notice.
Session expiry mid-session → silent refresh; if refresh fails, redirect to `/login`
with a "your session expired" notice and the intended destination preserved.

## States

- loading: submit button shows a busy state and is disabled; the form stays readable.
- empty: first-visit form with no residual values; autofocus on the first field.
- error: field-level messages under each input, a form-level message for credential and
  rate-limit failures, `aria-live=polite`, focus moved to the first invalid field.
  An expired or already-used email link shows one recovery action — request a new link.
- success: redirect; no flash of protected content before the redirect. Reset success
  states plainly that every other session was signed out.
- disabled / permission denied: protected routes redirect rather than rendering an
  empty shell; a signed-in user visiting `/login` goes to `/dashboard`. Resend is
  disabled with a visible countdown while rate limited.

## Email content

Plain, credible, no marketing tone (CDC §78). Each message states what was requested,
carries one primary link, gives the expiry in words ("valable 24 heures"), and tells
the reader what to do if they did not request it. Every message has a plain-text part.

## Responsive and accessibility requirements

- Single-column form from 320px; labels visible, never placeholder-only.
- Password field has a show/hide control that is keyboard reachable and announced.
- Errors are associated by `aria-describedby`; the submit path is fully keyboard usable.
- The verification banner is dismissible, does not trap focus and is not colour-only.
- No animation on error; respects `prefers-reduced-motion`.
