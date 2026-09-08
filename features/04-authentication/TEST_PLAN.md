# Test plan

## Unit

- Zod schemas: email normalisation, password rule, timezone validity, goal enum.
- Password hashing verifies a correct password and rejects a wrong one.
- Token service: expiry, subject, rotation produces a new token and revokes the old.
- Email token service: hashing, purpose scoping, single use, issuing invalidates prior.
- Template rendering: every template produces both HTML and plain text, and the link is
  built from `APP_URL`.

## Integration

- Register → login → refresh → logout happy path.
- Duplicate email → 409.
- Wrong password and unknown email return an identical body, status and timing.
- Reusing a rotated refresh token → 401 and the whole family is revoked.
- Registration enqueues exactly one `verify-email` job; a queue failure still returns 201.
- Verify with a valid token sets `emailVerified`; reusing it → 400 `INVALID_TOKEN`.
- Expired and unknown verification tokens return the same response as a used one.
- `forgot` for a non-existent address returns 202 and enqueues nothing.
- Reset with a valid token changes the password, revokes every refresh token and
  enqueues `password-changed`.
- Rate limiter returns 429 with `Retry-After` on login, forgot and resend.
- `GET /me` with no, expired, or malformed token → 401.

## End to end

- Register, land on the dashboard, reload, still signed in, banner shown.
- Read the verification mail from the local inbox, follow the link, banner disappears.
- Forgot password, follow the emailed link, set a new password, old session is dead and
  the new password works.
- Sign out, then a protected URL redirects to `/login?next=…` and returns there after login.
- A browser-side assertion proves no token is reachable from `document.cookie` or storage.

## Edge cases and regression risks

- Concurrent refreshes from two tabs must not lock the user out.
- Two reset links requested in a row: only the newest works.
- A reset link followed after the password was already changed by another link.
- SMTP unavailable: the user journey completes, the job retries, nothing is lost.
- Clock skew near access-token expiry; very long display names; unicode emails.
