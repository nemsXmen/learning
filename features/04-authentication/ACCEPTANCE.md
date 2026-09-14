# Acceptance criteria

- [x] Register, login, refresh, logout and `GET /me` behave as contracted
- [x] Email verification and password reset work end to end against a local inbox
- [x] Email tokens are hashed, purpose-scoped, single use and time limited
- [x] A password reset revokes every session and notifies the account owner
- [x] Mail is queued with retry; SMTP being down never fails a user action
- [x] `forgot` and `resend` cannot be used to discover whether an address has an account
- [x] No token is readable by client JavaScript - both cookies are HttpOnly, no token
      appears in any response body or in the rendered HTML (verified over HTTP; a
      Playwright assertion still has to replace the manual check)
- [x] Refresh rotation is single use and family revocation works
- [x] Rate limiting is enforced per IP and per account on login, forgot and resend
- [x] Protected routes redirect and restore the intended destination
- [x] Form and banner states - axe (WCAG 2.1 AA) passes on login, register and
      forgot-password in both themes, focus stays visible at every tab stop, and the
      login form is filled and submitted by keyboard alone (`pnpm test:a11y`)
- [x] Every email has a plain-text part and a credible, non-marketing tone
- [x] Automated tests pass
