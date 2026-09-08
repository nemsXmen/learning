# Architecture decisions and open questions

Format per entry: Status, Context, Decision, Consequences, CDC question or assumption.
Decisions marked **assumption** must be confirmed by the CDC owner before the feature
that depends on them is accepted.

---

## Decision: Stack imposed by the CDC

- Status: accepted
- Context: CDC §37, §38, §41, §89 name the stack explicitly.
- Decision: Next.js (App Router) + React + TypeScript + Tailwind + TanStack Query +
  React Hook Form + Zod + nuqs on the web; NestJS + TypeORM + PostgreSQL + Redis +
  BullMQ on the API. Prisma is excluded.
- Consequences: no evaluation needed; these are constraints, not choices. Anything
  added beyond this list needs its own entry below.
- CDC question or assumption: none.

## Decision: pnpm workspaces without a build orchestrator

- Status: accepted
- Context: CDC §82 shows `pnpm-workspace.yaml`; nothing requires Turborepo or Nx.
- Decision: plain pnpm workspaces with `pnpm -r` scripts. Revisit an orchestrator only
  when CI wall time or cache misses justify the dependency.
- Consequences: simplest possible root; no remote caching until it is earned.
- CDC question or assumption: none.

## Decision: NestJS owns `content/`, Next.js renders what it returns

- Status: accepted
- Context: CDC §63 places Content Markdown behind NestJS; CDC §43 puts loading,
  parsing, validation and Markdown conversion in a `ContentService`.
- Decision: `apps/api` is the only process that reads `content/`. It returns parsed
  frontmatter plus sanitized rendered HTML; `apps/web` renders that payload.
- Consequences: one parser, one syntax-highlighting theme, one cache. The web app has
  no filesystem dependency and can be deployed independently.
- Alternative rejected: shipping raw Markdown to Next.js and rendering there —
  duplicates the parser and splits code-block styling across two runtimes.
- CDC question or assumption: none.

## Decision: Frontmatter is the only content metadata source

- Status: accepted
- Context: CDC §5 shows a `metadata.json` next to `lesson.md`, while CDC §7 makes
  frontmatter mandatory so the engine can understand content without parsing the body.
- Decision: no `metadata.json`. Chapter metadata lives in the `lesson.md` frontmatter;
  quizzes live in `quiz.yaml`; the skill graph lives in `<technology>/skills.yaml`.
- Consequences: a single place to edit, no drift between two files. `content:validate`
  enforces the schema.
- CDC question or assumption: **assumption** — confirm `metadata.json` is not required
  by an external tool.

## Decision: Synchronous grading, asynchronous follow-up

- Status: accepted
- Context: CDC §40 routes quiz completion through a queue, while CDC §76 and §80
  require immediate pedagogical feedback and visible mastery deltas.
- Decision: grading, mastery update, review scheduling and XP are computed inside the
  request transaction. BullMQ carries achievement detection, analytics rollups,
  reminder generation and content indexing — work no screen waits for.
- Consequences: the result screen is always correct and consistent; queue outages
  degrade badges and analytics, never learning. Engine calls stay pure and fast.
- CDC question or assumption: none.

## Decision: Zod as the single validation language

- Status: accepted
- Context: CDC §89.18 mandates Zod; NestJS conventionally uses class-validator.
- Decision: `packages/validation` holds Zod schemas used by API pipes, content
  validation and web forms. class-validator is not introduced.
- Consequences: one schema shared across the boundary; API DTO types are `z.infer`
  results. A small Zod validation pipe is written once in the API.
- CDC question or assumption: none.

## Decision: Session cookie at the Next.js edge, JWT behind it

- Status: accepted
- Context: CDC §48 requires a secure JWT/session architecture; §37 and §89.21 forbid
  exposing the API or its tokens to the browser.
- Decision: the API issues a short-lived access token and a rotating refresh token.
  Next.js route handlers store both in httpOnly, secure, `SameSite=Lax` cookies and
  attach the access token server-side. The browser holds no token it can read.
- Consequences: refresh happens in the Next.js server runtime; logout revokes the
  refresh token server-side. No token parsing in client components.
- CDC question or assumption: none.

## Decision: argon2id for password hashing

- Status: accepted
- Context: the CDC specifies authentication but not a hashing algorithm.
- Decision: `argon2` (argon2id), parameters in config, never inline in code paths.
- Consequences: one native dependency in the API; documented in `development.md`.
- CDC question or assumption: none.

## Decision: Transactional email over SMTP, sent from a queue

- Status: accepted
- Context: CDC §48 requires email verification and password reset; the CDC named no
  provider. The project owner has specified SMTP credentials supplied through `.env`.
- Decision: the API sends mail through a single `MailService` wrapping an SMTP
  transport (`nodemailer`), configured entirely from environment variables. Sending is
  enqueued on a BullMQ `email` queue with retry and backoff, never awaited in a request.
  Local development uses Mailpit in Docker so no real SMTP account is needed.
- Consequences: one dependency added (`nodemailer`), justified by SMTP being the chosen
  transport. A slow or failing mail server delays a message, never a registration.
  Swapping to an API-based provider later means replacing one service, not a flow.
- Alternative rejected: sending inline in the request — a 30-second SMTP timeout would
  become a 30-second registration.
- CDC question or assumption: none. Sender identity comes from `MAIL_FROM`.

## Decision: An in-app `/design` gallery instead of Storybook

- Status: accepted
- Context: slice 00 needs a surface where every component, variant and state is visible
  from the first week, so design stops being a late blocking milestone.
- Decision: a `/design` route inside `apps/web`, dev-only and `noindex`, rendering the
  component gallery. No Storybook, no second build pipeline.
- Consequences: zero new dependency, the gallery uses the real app runtime and themes,
  and a component that is not in the gallery is visibly not done. No isolated-render
  addons or visual-regression tooling until something needs them.
- CDC question or assumption: none.

## Decision: Vitest for packages and web, Jest for the API

- Status: accepted
- Context: CDC §73 requires unit, integration and E2E tests, exhaustively for the
  learning engine.
- Decision: Vitest in `packages/*` and `apps/web`; Jest + Supertest in `apps/api`
  (the NestJS default); Playwright for the few critical end-to-end journeys.
- Consequences: each runtime keeps its native toolchain instead of being forced into
  a shared one. Coverage thresholds are enforced on `packages/learning-engine`.
- CDC question or assumption: none.

## Decision: TypeORM migrations only, never `synchronize`

- Status: accepted
- Context: standard operational safety; CDC §41 makes PostgreSQL the source of truth
  for user state.
- Decision: `synchronize: false` in every environment, including local. Schema changes
  ship as reviewed migrations.
- Consequences: one extra command in the local setup, documented in `development.md`.
- CDC question or assumption: none.

---

# Open questions

These block acceptance of the features named. Do not guess an answer in code.

## Question: does an unverified account get restricted

- Affects: `04-authentication`.
- Current handling: **assumption** — an unverified account can sign in and learn; the
  only consequence is a dismissible banner with a resend action. Blocking learning on
  email deliverability would punish the learner for an SMTP problem.
- Needed: confirmation, or the list of actions that should require a verified address.

## Question: mastery, priority and XP formulas are described conceptually

- Affects: `09-learning-engine-core`, `10-skill-mastery-and-review`, `11-xp-streak-and-levels`.
- CDC §15 gives `priority = weakness × forgettingRisk × importance × prerequisiteImpact`,
  §16 gives review intervals, §25 gives XP values, §26 gives anti-farming rules — all
  without exact coefficients.
- Current handling: the engine ships a documented, versioned, fully unit-tested default
  parameter set in one file, tuned by table-driven fixtures rather than by scattered
  constants. Every number is a reviewable input, not a hidden magic value.
- Needed: confirmation of the default weights, or an owner to tune them against fixtures.

## Question: level curve and difficulty bands are undefined

- Affects: `11-xp-streak-and-levels` (CDC §25 names 50 levels), `08-quiz-and-attempts`
  (CDC §77 adaptive difficulty within Easy/Medium/Hard/Expert).
- Current handling: a single monotonic XP-per-level table in one config file; adaptive
  difficulty is clamped to the four named bands.
- Needed: confirmation of the curve shape, and of what a level unlocks, if anything.

## Question: streak timezone and grace rules

- Affects: `11-xp-streak-and-levels`.
- Current handling: **assumption** — a learning day is the user's local calendar day
  from their profile timezone, with no grace day and no streak freeze.
- Needed: confirmation, or the intended grace/freeze rule.

## Question: what counts as activity for a streak

- Affects: `11-xp-streak-and-levels`, `13-dashboard-next-best-action`.
- Current handling: **assumption** — any XP-earning event completed that day. Passive
  page views do not count, consistent with CDC §26.
- Needed: confirmation.

## Question: open-ended and code answers cannot be graded deterministically

- Affects: `08-quiz-and-attempts` (CDC §9 lists open questions and code exercises;
  CDC §67 forbids relying on AI for V1).
- Current handling: V1 grades multiple choice, multiple answer, true/false and output
  prediction. Open-ended and code items are authored and stored but excluded from
  scoring and mastery until a grader exists.
- Needed: the V2 grading approach (rubric, tests, or AI-assisted review).

## Question: chapter unlocking rule

- Affects: `05-learning-catalog`, `13-dashboard-next-best-action`.
- CDC §79 shows a locked chapter; §19 requires an adaptive graph rather than a list.
- Current handling: **assumption** — a chapter is unlocked when every prerequisite
  skill reaches the mastery pass threshold, and the engine may still recommend a
  review before an unlocked chapter rather than blocking it (CDC §14).
- Needed: confirmation that unlocking is advisory-plus-hard-gate as described.
