# Requirements

## Goal

Any client can fetch a chapter as ready-to-render, safe HTML with its metadata, fast,
without the answer keys ever leaving the server.

## Scope

### Must

- `ContentService` in `apps/api`: load via `packages/content`, render Markdown to
  sanitized HTML with server-side syntax highlighting, extract a heading outline.
- Redis render cache keyed by `contentPath + contentVersion`; a content change
  invalidates naturally rather than by manual flush.
- `content:sync` command: upsert technologies, modules, chapters, skills, skill edges,
  chapter-skill links and quiz rows; remove rows whose content disappeared.
- Read endpoints for a chapter and for quiz metadata, excluding answers.
- A fail-fast boot check: the API refuses to start on an invalid content tree.

### Must not

- No question `answer` or `explanation` in any read response.
- No lesson body stored in PostgreSQL (CDC §42, §89.7).
- No filesystem access from `apps/web`.
