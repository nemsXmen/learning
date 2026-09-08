# Contract

## Inputs and outputs

Consumes `GET /content/chapters/:tech/:chapter` (slice 03), the module tree from
slice 05, and progress from slice 07. It defines no new API resource of its own.

## API or event boundary

Browser-facing, via Next.js route handlers:
- `POST /api/learn/chapters/:id/progress` ← `{ progressPercent, timeSpentSeconds }`
  → `200 { status, progressPercent }` (proxied to slice 07).
- `POST /api/learn/chapters/:id/complete` → `200 { status: "COMPLETED", xpAwarded }`.

## Validation and errors

- `progressPercent` 0–100, `timeSpentSeconds` non-negative and capped per report to
  reject implausible jumps; the server clamps rather than trusting the client.
- Locked chapter → `403 CHAPTER_LOCKED`, rendered as an explanatory page, not a crash.
- Unknown chapter → the framework 404 page.

## Invariants

- Progress never decreases from a scroll report.
- Rendering is deterministic for a given `contentVersion`.
- The answer key for the chapter quiz is never present in the page payload.
