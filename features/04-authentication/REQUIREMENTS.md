# Requirements

## Goal

A learner registers, verifies their address, signs in, stays signed in across
refreshes, recovers a forgotten password and signs out — with no token ever readable
by client JavaScript.

## Scope

### Must

- API: register, login, refresh (rotating), logout, `GET /me`.
- Email verification: a token emailed at registration, a confirm endpoint, and a resend
  that is rate limited.
- Password reset: request by email, reset by token; a successful reset revokes every
  refresh token the user holds.
- `MailService` over SMTP configured from `.env`, sending through a BullMQ `email`
  queue with retry and backoff; plain-text and HTML bodies for every message.
- argon2id password hashing; refresh and email tokens stored hashed and revocable.
- Next.js route handlers under `app/api/auth/*` that own the httpOnly session cookies
  and are the only place tokens are read or written.
- Pages `/register`, `/login`, `/logout`, `/verify-email`, `/forgot-password`,
  `/reset-password`.
- Middleware protecting `/dashboard`, `/learn`, `/boost`, `/profile`; unauthenticated
  access redirects to `/login?next=…`.
- Redis rate limiting on register, login, refresh, forgot-password and resend, per IP
  and per account.
- Onboarding fields captured at registration: goal and daily minutes target (CDC §34).

### Must not

- No OAuth or social login.
- No token in `localStorage`, `sessionStorage`, a non-httpOnly cookie or a client prop.
- No email sent inline in a request; a mail failure never fails registration or reset.
- No response that reveals whether an address has an account.
