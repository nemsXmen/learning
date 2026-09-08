# Architecture

Source of truth: [CDC.md](./CDC.md). Every non-obvious choice below is justified in
[decisions.md](./decisions.md). Data shapes live in [data-model.md](./data-model.md),
content rules in [content-model.md](./content-model.md).

## 1. What the system is

An adaptive learning system whose curriculum is Git-versioned Markdown.

| Concern | Owner |
| --- | --- |
| Knowledge (lessons, quizzes, skill graph) | `content/` Markdown + YAML, versioned in Git |
| User state (progress, mastery, XP, streak) | PostgreSQL |
| Pedagogical intelligence | `packages/learning-engine` (pure, deterministic) |
| Application engine | `apps/api` (NestJS) |
| User experience | `apps/web` (Next.js) |
| Asynchronous follow-up work | Redis + BullMQ |

## 2. Component map

```text
                     ┌───────────────────────┐
                     │        Browser        │
                     └───────────┬───────────┘
                                 │ HTTPS, session cookie only
                                 ▼
                     ┌───────────────────────┐
                     │  apps/web (Next.js)   │
                     │  RSC + route handlers │  holds tokens, never ships them
                     └───────────┬───────────┘
                                 │ HTTP + Bearer access token (server-to-server)
                                 ▼
                     ┌───────────────────────┐
                     │  apps/api (NestJS)    │ ──► packages/learning-engine
                     └───┬────────┬────────┬─┘     (pure functions, no I/O)
                         │        │        │
        ┌────────────────┘        │        └────────────────┐
        ▼                         ▼                         ▼
  PostgreSQL               Redis / BullMQ            content/ (read-only FS)
  (user state)             (cache, queues)           (knowledge)
                                  │
                                  └──► SMTP (transactional email)
```

## 3. Repository layout

```text
apps/
  web/                  Next.js App Router, the only origin the browser talks to
  api/                  NestJS modules, the only reader of content/ and PostgreSQL
packages/
  types/                domain types and enums, zero runtime dependencies
  validation/           Zod schemas for API contracts, forms and content frontmatter
  learning-engine/      mastery, forgetting risk, priority, recommendation, XP, streak
  content/              frontmatter parsing, Markdown rendering, content graph loading
  ui/                   design-system components shared by web surfaces
  config/               shared tsconfig / eslint / prettier bases
content/                javascript/, typescript/ ... (V1 ships the first two)
scripts/                content validation and database helpers
docker/                 local PostgreSQL and Redis
```

Rule: a package may depend downward only — `web`/`api` → `validation` → `types`,
and `api` → `content` → `types`. `learning-engine` depends on `types` alone.

## 4. Boundaries

### Browser ↔ Next.js
The browser sends only a first-party httpOnly session cookie. It never receives a
JWT, a refresh token, an API URL or any service credential. Read paths are Server
Components calling the API server-side; mutation and client-fetch paths go through
Next.js route handlers under `app/api/*` (CDC §37).

### Next.js ↔ NestJS
Server-side only, over the private network, with the user's access token in the
`Authorization` header. Next.js adds no business rules: it proxies, shapes for the
view and renders. A rule that exists only in `apps/web` is a bug.

### NestJS ↔ content/
`apps/api` is the single process that reads `content/`. It parses frontmatter,
validates against the content schema, renders Markdown to sanitized HTML and caches
the result in Redis keyed by content version. `apps/web` never touches the filesystem.

### NestJS ↔ learning-engine
The engine receives plain snapshots (mastery rows, attempt history, clock) and
returns decisions with a `reason`. It performs no I/O, reads no clock of its own and
holds no framework types, so every pedagogical rule is unit-testable in isolation
(CDC §64, §67, §73).

## 5. Request and data flow

Reading a chapter:

```text
Browser → /learn/javascript/closures (RSC)
        → api GET /chapters/:slug         → content cache or content/ parse
        → api GET /me/progress/:chapterId → PostgreSQL
        → rendered page + "mark as read" action
```

Answering a quiz:

```text
Browser → POST /api/quiz/:id/attempt (Next route handler)
        → api POST /quizzes/:id/attempts
             ├─ grade against content answer key      (never sent to the browser)
             ├─ update SkillMastery + next_review_at  (synchronous, same transaction)
             ├─ write XPTransaction                   (idempotent per source)
             └─ enqueue follow-up job (achievements, analytics, notifications)
        → response: per-question feedback, mastery deltas, next best action
```

Grading is synchronous because the user must immediately see why an answer was wrong
and what moved (CDC §76, §80). Queues carry only work no screen is waiting for
(CDC §40) — see [decisions.md](./decisions.md#decision-synchronous-grading-asynchronous-follow-up).

## 6. Security assumptions

- Secrets (`DATABASE_URL`, `REDIS_URL`, `JWT_*`, API base URL) exist only in the
  Next.js server runtime and the API. No `NEXT_PUBLIC_*` variable carries a credential.
- Session cookie: httpOnly, secure, `SameSite=Lax`, first-party. Access token short
  lived, refresh token rotated on use and revocable server-side.
- Quiz answer keys and explanations for unanswered questions never leave the API.
- Every `/me/*` and progress-mutating route authorizes on the token subject; a user
  id is never accepted from the request body.
- Authentication endpoints are rate limited in Redis, per IP and per account.
- SMTP credentials live only in the API runtime. Email tokens are stored hashed and are
  single use; a message body is the only place a plaintext token exists.
- `content/` is trusted input (Git-reviewed, CI-validated); rendered HTML is still
  sanitized so a bad chapter cannot become stored XSS.
- No user-supplied code is executed anywhere in V1 (CDC §56). The exercise contract
  is shaped so a future isolated sandbox can be added behind a queue (CDC §57).
- Private routes (`/dashboard`, `/learn`, `/boost`, `/profile`) are `noindex` (CDC §61).

## 7. What V1 deliberately does not build

Projects, Interview Mode, Monaco/code execution, achievements beyond the data model,
reminder and notification emails, AI features, and technologies beyond JavaScript and
TypeScript. Transactional email (verification, password reset) does ship in V1, over
SMTP from `.env`. Each is listed with its unblocking condition in
[roadmap.md](./roadmap.md).
