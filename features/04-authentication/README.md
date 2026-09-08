# Feature: Authentication

Slice 04. Account creation, session lifecycle, email verification and password reset,
with the browser holding a cookie and nothing else.

Depends on: 01. Blocks: 06, 07, 08, 10, 11, 12, 13.
References: `docs/decisions.md` — session cookie at the Next.js edge, JWT behind it;
transactional email over SMTP, sent from a queue.
