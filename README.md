# Project context

This repository was initialized from a requirements document (CDC).

Start with [SCAFFOLD_PROMPT_AGENTS.md](./SCAFFOLD_PROMPT_AGENTS.md), then read
[docs/CDC.md](./docs/CDC.md). The implementation architecture is intentionally
not preselected: derive it from the CDC and record decisions in `docs/`.

The architecture is now defined. Start with
[docs/architecture.md](./docs/architecture.md) and
[docs/roadmap.md](./docs/roadmap.md).

## Context layout

- `agents/`: responsibilities and delivery boundaries for each specialist
- `docs/`: CDC, architecture, decisions, delivery and technical rules — see
  [docs/README.md](./docs/README.md)
- `features/`: one short specification pack per feature — see
  [features/README.md](./features/README.md)

Do not load all context files by default. Read only the files relevant to the
current task.
