# Features

One folder per feature, each a small independently testable slice. Delivery order and
dependencies live in [../docs/roadmap.md](../docs/roadmap.md).

| # | Feature | Owns |
| --- | --- | --- |
| 00 | [design-system](./00-design-system/) | tokens, primitives, app shell, `/design` gallery |
| 01 | [platform-foundation](./01-platform-foundation/) | workspace, infrastructure, CI |
| 02 | [content-model-and-validation](./02-content-model-and-validation/) | content schema, `content:validate`, seed content |
| 03 | [content-engine-api](./03-content-engine-api/) | parsing, rendering, caching, `content:sync` |
| 04 | [authentication](./04-authentication/) | accounts and session lifecycle |
| 05 | [learning-catalog](./05-learning-catalog/) | technologies, modules, chapters, lock state |
| 06 | [chapter-reader](./06-chapter-reader/) | the reading experience |
| 07 | [progress-tracking](./07-progress-tracking/) | `user_progress` and completion events |
| 08 | [quiz-and-attempts](./08-quiz-and-attempts/) | serving, grading, pedagogical feedback |
| 09 | [learning-engine-core](./09-learning-engine-core/) | pure pedagogical decisions |
| 10 | [skill-mastery-and-review](./10-skill-mastery-and-review/) | mastery state and review schedule |
| 11 | [xp-streak-and-levels](./11-xp-streak-and-levels/) | XP ledger, levels, streak, achievements |
| 12 | [boost-session](./12-boost-session/) | the adaptive 5–15 minute session |
| 13 | [dashboard-next-best-action](./13-dashboard-next-best-action/) | the daily entry point |
| 14 | [public-landing](./14-public-landing/) | the public, indexable entry page |

`_template/` is the starting shape for a new pack. Each pack contains `README.md`,
`REQUIREMENTS.md`, `CONTRACT.md`, `UX.md`, `TEST_PLAN.md` and `ACCEPTANCE.md`.
