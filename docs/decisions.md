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

## Decision: the content graph is bundled at build time, not read at runtime

- Status: accepted (amends "NestJS owns `content/`")
- Context: the API read `content/` from disk at boot, with `CONTENT_DIR` resolved
  relative to the working directory. Deployed to a serverless platform this fails
  twice: `resolve('/var/task', '../../content')` yields `/content`, and a bundler
  traces static imports only — a directory read through a path from an
  environment variable is never packaged, so the Markdown is not deployed at all.
- Decision: `pnpm content:bundle` turns `content/` into a committed JSON module
  that the API imports statically. `ContentService` and `content:sync` both read
  that module; neither touches the filesystem.
- Consequences: the runtime has no dependency on repository layout or working
  directory, and a cold start no longer walks and validates a tree. `CONTENT_DIR`
  becomes an authoring concern with a default, so a deployment need not set it.
  The generated file duplicates the Markdown in Git; a test fails if it drifts
  from the source, which is the guard against serving stale content.
- Consequence to watch: the bundle contains every answer key. On disk these were
  unreachable from the browser; as a static import they would be shipped to it,
  so a lint rule forbids `apps/web` from importing `@app/content`.
- CDC question or assumption: none. Markdown stays the source of truth in Git
  (§89.5); only the way it reaches the runtime changes.

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

## Decision: no `learning_session` table; the XP ledger is the activity record

- Status: accepted (answers the question left open by slice 07)
- Context: `learning_session` was listed under Must in slice 07. Its purpose was
  to give streaks and analytics a source of "did this learner act today".
- Decision: the streak reads the XP ledger instead. Earning XP is the definition
  of activity — which is exactly the CDC §26 rule that reading a page again is
  not effort. Boost sessions, which have a real start and end, keep their own
  table in slice 12.
- Consequences: one table fewer and no third notion of a session for slices 11
  and 12 to contradict. Analytics that later need session windows will have to
  reconstruct them from attempts and progress timestamps, or introduce the table
  then with a shape driven by a real requirement.
- CDC question or assumption: **assumption** — that activity means "earned XP
  today" rather than "opened the app today". Recorded in the open questions.

## Decision: achievements are detected synchronously, not on BullMQ

- Status: accepted (amends the slice 11 pack)
- Context: the pack asks for detection on a BullMQ queue so it cannot block the
  learning path. A worker needs a process that stays alive, and there is none on
  the serverless host this project deploys to for testing.
- Decision: detection runs as a listener on `xp.awarded`, in the same request.
  The event bus logs and swallows a listener error, so a badge failing cannot
  undo XP, mastery or a completed chapter — which is the property the pack
  actually wanted.
- Consequences: detection cost is added to the request that earned the XP; it is
  a handful of indexed reads. If it ever grows, the same `MAIL_DRIVER` pattern
  applies — a queue where a worker can run, inline where none can.
- CDC question or assumption: none.

## Decision: `nestjs-zod` and a global APP_PIPE

- Status: accepted (refines "Zod as the single validation language")
- Context: validation was a pipe instantiated per parameter,
  `@Body(new ZodValidationPipe(schema))`. It worked, but a handler that forgot it
  was silently unvalidated, and the schema had to be repeated next to the type.
- Decision: `nestjs-zod`'s `createZodDto` turns a schema into a class that carries
  it, and the pipe is registered once as `APP_PIPE`. A body is validated because
  its type says so, not because the author remembered a decorator argument.
- Consequences: one dependency (`@nestjs/swagger` is an optional peer we do not
  install), and zod moves from ^3.24 to ^3.25 across the workspace, which the
  library requires. The validation exception stays ours — `apps/web` reads
  `fields` to place errors under the right input, and that contract predates this
  change.
- Route parameters are unaffected: their metatype is `String` with no schema, so
  the global pipe passes them through. They keep explicit pipes, now declared
  once in `params.pipe.ts` instead of inlined at each call site.
- Alternative rejected: a hand-rolled ~15-line `createZodDto`. It would have
  avoided the dependency, but this is a solved problem with a maintained library,
  and the hand-rolled version would need the same metatype plumbing.
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
- Decision: argon2id via `@node-rs/argon2`, whose prebuilt binaries avoid a
  node-gyp toolchain on every developer machine and in CI.
- Consequences: one native dependency in the API, installed without a compiler;
  documented in `development.md`.
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

## Decision: markdown-it + sanitize-html + highlight.js for rendering

- Status: accepted
- Context: CDC §43 puts Markdown conversion in the API, §23 asks for premium code
  blocks, and §60 requires a first-class dark theme alongside light.
- Decision: `markdown-it` parses, `highlight.js` highlights, `sanitize-html` is the
  last step in the pipeline. Three dependencies, all CommonJS.
- Consequences: highlight.js emits semantic CSS classes (`hljs-keyword`), so one
  stylesheet themes code in both light and dark from `packages/ui` tokens. Sanitising
  last means nothing downstream can reintroduce markup. All three load under the
  API's CommonJS runtime without ESM interop work. `sanitize-html` is pinned to
  2.13.1: from 2.14 it pulls htmlparser2 v12, which is pure ESM and cannot be
  loaded by Jest. Revisit when the API moves to ESM.
- Alternative rejected: the unified/remark/rehype stack with Shiki — nine packages,
  pure ESM against a CommonJS Nest runtime, and Shiki inlines colours, which would
  hard-code one palette and defeat theme switching.
- CDC question or assumption: none.

## Decision: two mail drivers, `inline` by default

- Status: accepted (amends "Transactional email over SMTP, sent from a queue")
- Context: a BullMQ worker holds a blocking Redis connection and waits for jobs,
  so it needs a process that stays alive. A serverless function is frozen once it
  responds: `queue.add()` would keep working and nothing would ever consume the
  jobs. Verification and reset mails would pile up unsent.
- Decision: `MAIL_DRIVER` selects the transport. `inline` — the default — awaits
  SMTP inside the request, with two bounded attempts. `queue` keeps BullMQ, with
  retries and backoff, and starts the worker.
- Consequences: the platform stops dictating whether email works. The default
  costs latency and durability, measured locally at 0.74s versus 0.19s for
  registration; a message failing both inline attempts is lost, because there is
  no queue to retry it later. Set `MAIL_DRIVER=queue` on any host that runs a
  long-lived process — it is strictly better where it can run.
- Alternative rejected: a cron-triggered function draining the queue. BullMQ has
  no clean "process N jobs and return" API, so it means working against its model
  for a minute of latency at best.
- CDC question or assumption: none, but rule 34 is amended: mail is no longer
  always enqueued. What holds unconditionally is that a mail failure never fails
  the action.

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

## Decision: ESLint flat config at the root, not `next lint`

- Status: accepted
- Context: `next lint` is deprecated and prompts interactively when no config
  exists, which cannot run in CI; and slice 00 needs a rule that keeps colours in
  the token file.
- Decision: one flat `eslint.config.mjs` at the workspace root, run as `eslint .`.
  It carries the typescript-eslint recommended set plus a `no-restricted-syntax`
  rule banning hard-coded hex colours in `packages/ui` and `apps/web`.
- Consequences: one config for every package instead of one per app; the colour
  rule is enforced by tooling rather than by convention. Tests are exempt, since
  they legitimately assert on literals the source must not contain.
- CDC question or assumption: none. Spacing and duration literals are not covered
  yet; a Tailwind-aware rule would be needed and is not justified today.

## Decision: a hand-rolled typed event bus, not @nestjs/event-emitter

- Status: accepted
- Context: slice 07 emits `chapter.completed`, which slices 10 and 11 consume to
  update mastery and award XP. Those consumers must run inside the same request
  (docs/decisions.md, synchronous grading), so the bus has to await listeners.
- Decision: a ~40-line `DomainEvents` service with a typed event map, awaited
  emission, and unsubscribe. No dependency added.
- Consequences: event names and payloads are checked by the compiler, and a
  listener that throws is logged and skipped rather than undoing the action that
  emitted — an achievement failing must not un-complete a chapter. If wildcard
  subscriptions or cross-process events are ever needed, this is the moment to
  reconsider the dependency.
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

## Decision: hints and solutions as Markdown blocks rendered to native `<details>`

- Status: accepted
- Context: exercises and interview questions ended each chapter with no help, so a
  learner without the answer had to leave the platform to find one. CDC §30 gives
  projects hints and a solution; it says nothing for chapters.
- Decision: `:::indice`, `:::solution` and `:::reponse` blocks written under each item
  in `lesson.md`, parsed by a small markdown-it block rule and rendered as `<details>`.
  Hints reveal in order through CSS alone; the solution is always one action away.
  `content:validate` makes the help mandatory, as it already does for quiz
  explanations (CDC §76).
- Consequences: the lesson stays the single source; no new file type, no payload change,
  no client script, keyboard access for free. Three fixed block names did not justify a
  plugin dependency. Nothing records that a hint or a solution was opened, so the engine
  cannot use it — see the open question below.
- CDC question or assumption: **assumption** — opening a solution costs no XP and does
  not lower mastery in V1.

## Decision: parts are declared in `technology.yaml`, not as a directory level

- Status: accepted
- Context: the JavaScript programme has 21 parts over 64 modules. A flat list of 64
  modules is unreadable, and the content tree had no level above modules.
- Decision: `technology.yaml` declares `parts` (slug, title, order, description) and
  each `module.yaml` names its `part`. Optional per technology; once declared, every
  module must belong to one (`UNKNOWN_PART`). The catalog groups modules by part and
  derives a part's progress from its chapters; a part without modules reads as
  « En préparation », so the whole programme is visible before it is written.
- Consequences: no path, URL or database change — chapter URLs, content paths and the
  PostgreSQL mirror are untouched, and TypeScript keeps its flat list. Parts are
  display structure only: unlocking still follows skills.
- CDC question or assumption: none.

# Open questions

These block acceptance of the features named. Do not guess an answer in code.

## Question: where does the API run, given it needs a long-lived process

- Affects: deployment of `apps/api`.
- The mail worker (`MailWorker`) holds an open BullMQ `Worker`, and a serverless
  function is frozen once it responds — verification and reset emails would never
  be sent there. TypeORM pooling and the Redis connection assume a long process too.
- Current handling: content bundling removed the filesystem obstacle and
  `MAIL_DRIVER=inline` removes the worker obstacle, so the API boots and sends mail
  on a serverless platform. What remains unsolved there: no retry for a failed
  message, TypeORM opening a pool per cold start, and no home for future background
  work (analytics rollups, achievement detection, reminders).
- Needed: a decision before production — a process host for the API (Railway, Fly,
  Render, a container) with `MAIL_DRIVER=queue`, or an always-on worker beside the
  functions.

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
- Current handling: **assumption, now implemented** — the streak advances when XP is
  earned, and only then. Passive page views do not count, consistent with CDC §26.
  There is no separate activity table; the ledger is the record.
- Needed: confirmation. If opening the app should count, the streak needs its own
  activity signal rather than reading the ledger.

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

## Question: should opening a hint or a solution count as evidence

- Affects: `06-chapter-reader`, `10-skill-mastery-and-review`.
- Current handling: **assumption** — no. Hints and solutions are native `<details>`,
  nothing is recorded, and neither XP nor mastery moves.
- Needed: whether « je ne sais pas » should weaken the skill it belongs to or schedule a
  review. Either would mean recording the action server-side.
