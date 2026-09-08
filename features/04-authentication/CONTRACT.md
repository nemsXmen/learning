# Contract

## Inputs and outputs

`POST /auth/register` ← `{ email, password, displayName, goal, dailyMinutesTarget, timezone }`
→ `201 { user: { id, email, displayName, emailVerified: false }, accessToken,
refreshToken, expiresIn }` and a queued verification email.

`POST /auth/login` ← `{ email, password }` → `200` same shape.

`POST /auth/refresh` ← `{ refreshToken }` → `200 { accessToken, refreshToken, expiresIn }`;
the presented token is revoked and replaced in the same transaction.

`POST /auth/logout` ← `{ refreshToken }` → `204`, token revoked.

`GET /me` → `200 { id, email, displayName, emailVerified, timezone, goal,
dailyMinutesTarget, createdAt }`

`POST /auth/email/verify` ← `{ token }` → `200 { emailVerified: true }`.

`POST /auth/email/verify/resend` (authenticated) → `202` always, whether or not a mail
was actually queued.

`POST /auth/password/forgot` ← `{ email }` → `202` always, in constant time.

`POST /auth/password/reset` ← `{ token, password }` → `204`; every refresh token for
that user is revoked.

Browser-facing (Next.js): `POST /api/auth/register|login|logout|password/forgot|
password/reset|email/verify` — same bodies, no tokens in the response, cookies set or
cleared by the handler.

## Email boundary

Enqueues `email.send { template, to, variables }` on the `email` queue. Templates:
`verify-email`, `reset-password`, `password-changed`. Links are built from `APP_URL`.
Retry with exponential backoff; a message exhausting retries is logged with the
template and recipient hash, never the token.

## Validation and errors

- Email normalised and format-checked; password minimum 12 characters with a strength
  rule stated in the schema; both schemas shared between form and API.
- `409 EMAIL_TAKEN` on register.
- `401 INVALID_CREDENTIALS` for both unknown email and wrong password, with constant
  response time and no user enumeration.
- `401 INVALID_REFRESH_TOKEN` for expired, unknown or already-used tokens.
- `400 INVALID_TOKEN` for an unknown, expired or already-consumed email token; the
  response is identical for all three cases.
- `429 RATE_LIMITED` with `Retry-After`.

## Invariants

- Password hashes and token hashes never appear in any response or log.
- A refresh token is single use; reuse revokes the whole token family.
- An email token is single use, purpose-scoped and time limited; issuing a new one for
  a purpose invalidates the outstanding ones.
- A password reset revokes all sessions and sends a `password-changed` notice.
- `forgot` and `resend` return the same status and timing whether or not the account
  exists.
- Every authenticated route derives the user id from the token subject only.
- Cookies: `httpOnly`, `secure` when deployed, `SameSite=Lax`, first-party, scoped `/`.
- An unverified account can sign in and learn; verification gates nothing in V1 beyond
  the reminder banner (**assumption**, recorded in `docs/decisions.md`).
