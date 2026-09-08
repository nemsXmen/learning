# Requirements

## Goal

Content authors get an authoritative schema and a validator that explains failures in
their own terms, so invalid knowledge never reaches the platform.

## Scope

### Must

- Zod schemas in `packages/validation` for chapter frontmatter, `quiz.md` questions,
  `skills.yaml`, `technology.yaml` and `module.yaml`.
- `packages/content` loader: walk `CONTENT_DIR`, parse frontmatter, parse quizzes,
  build the skill graph, compute a content hash per file.
- Referential checks: unique ids and slugs, existing chapter prerequisites, existing
  skills, acyclic skill graph, valid answer indices, mandatory explanation, required
  body sections present, working relative links.
- `pnpm content:validate` prints `path:line — problem` and exits non-zero on any failure.
- Seed content: at least 3 JavaScript and 2 TypeScript chapters, each complete per
  CDC §74, with quizzes and a skills file per technology.

### Must not

- No database access and no HTTP; this slice is filesystem and pure logic only.
- No `metadata.json` (see `docs/decisions.md`).
- No auto-fixing of content; the validator reports, authors decide.
