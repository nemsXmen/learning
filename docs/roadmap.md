# Roadmap

Delivery order for MVP V1 (CDC §70): JavaScript and TypeScript only. Each slice is a
feature pack under `features/` with its own contract, tests and acceptance criteria. A
slice is not started before its dependencies are accepted.

## V1 slices

| # | Feature | Depends on | Done when |
| --- | --- | --- | --- |
| 00 | [design-system](../features/00-design-system/) | 01 (workspace) | tokens, primitives, app shell and the `/design` gallery render in both themes |
| 01 | [platform-foundation](../features/01-platform-foundation/) | — | workspace, Docker, CI, shared packages build green and an empty app boots end to end |
| 02 | [content-model-and-validation](../features/02-content-model-and-validation/) | 01 | `pnpm content:validate` passes on real seed content and fails on every documented violation |
| 03 | [content-engine-api](../features/03-content-engine-api/) | 02 | the API serves a parsed, rendered, cached chapter and its quiz metadata |
| 04 | [authentication](../features/04-authentication/) | 01 | register, login, refresh, logout, email verification and password reset work with no token readable by the browser |
| 05 | [learning-catalog](../features/05-learning-catalog/) | 03 | technologies, modules, chapters and the skill graph are queryable, with lock state |
| 06 | [chapter-reader](../features/06-chapter-reader/) | 03, 04, 05, 07 | a chapter reads well on desktop and mobile and records progress |
| 07 | [progress-tracking](../features/07-progress-tracking/) | 04, 05 | progress transitions are idempotent and time spent is bounded |
| 08 | [quiz-and-attempts](../features/08-quiz-and-attempts/) | 03, 04, 07 | an attempt is graded server-side and returns per-question pedagogical feedback |
| 09 | [learning-engine-core](../features/09-learning-engine-core/) | 01 | pure functions for mastery, forgetting risk, priority, recommendation, XP, streak, boost plan, exhaustively unit tested |
| 10 | [skill-mastery-and-review](../features/10-skill-mastery-and-review/) | 08, 09 | every graded attempt updates mastery and schedules the next review |
| 11 | [xp-streak-and-levels](../features/11-xp-streak-and-levels/) | 08, 09 | XP is an auditable ledger, unfarmable, and the streak follows the user's day |
| 12 | [boost-session](../features/12-boost-session/) | 10, 11 | a 5–15 minute adaptive session is generated, run and scored with visible deltas |
| 13 | [dashboard-next-best-action](../features/13-dashboard-next-best-action/) | 06, 11, 12 | the dashboard always shows one explained next best action |
| 14 | [public-landing](../features/14-public-landing/) | 00, 04 | the public page is complete, indexable, honest, and leads to registration |

09 has no runtime dependency on 03–08 and can be built in parallel from slice 01.

00 runs alongside everything: it needs only the workspace, and every UI slice consumes
it. Its `/design` gallery is what keeps progress visible between finished features —
a component appears there the day it exists, not the day its screen ships. Feature-
specific cards (`ChapterCard`, `QuizCard`, `BoostCard`, `MasteryCard`,
`AchievementCard`) are delivered by their own slice, so design never becomes a single
blocking milestone. Visual reference: [design.md](./design.md).

14 can start as soon as 00 is usable; it only needs registration links from 04.

## Deferred, with the condition that unblocks each

| Deferred | CDC | Unblocked by |
| --- | --- | --- |
| Reminder and notification emails | §36 | the notifications feature being scoped; SMTP transport already exists |
| Achievements surface (data model ships in 11) | §25 | the V1 loop being stable |
| Skill assessment / diagnostic | §18 | a calibrated question bank per technology |
| Projects and submissions | §29, §30 | a review and grading policy |
| Interview mode | §31 | an answer-evaluation approach that is not AI-dependent |
| Monaco editor and code execution | §56, §57 | an isolated sandbox with CPU/RAM/network limits |
| React, Next.js, NestJS, PostgreSQL, Ruby, Rails paths | §71 | content authored and validated for each |
| AI explanations and generation | §68 | the deterministic engine being trusted in production |

## Definition of done (CDC §85)

Backend · frontend · database · validation · error handling · loading state · empty
state · responsive · accessibility · tests · documentation. A slice that satisfies
ten of eleven is not done.
