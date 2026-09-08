# Acceptance criteria

- [ ] Register, login, refresh, logout and `GET /me` behave as contracted
- [ ] Email verification and password reset work end to end against a local inbox
- [ ] Email tokens are hashed, purpose-scoped, single use and time limited
- [ ] A password reset revokes every session and notifies the account owner
- [ ] Mail is queued with retry; SMTP being down never fails a user action
- [ ] `forgot` and `resend` cannot be used to discover whether an address has an account
- [ ] No token is readable by client JavaScript, asserted in an E2E test
- [ ] Refresh rotation is single use and family revocation works
- [ ] Rate limiting is enforced per IP and per account on login, forgot and resend
- [ ] Protected routes redirect and restore the intended destination
- [ ] Form and banner states — loading, empty, error, success, disabled — implemented and accessible
- [ ] Every email has a plain-text part and a credible, non-marketing tone
- [ ] Automated tests pass
