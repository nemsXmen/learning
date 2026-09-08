# Agent rules

## Context loading

Start with `README.md`, the relevant file in `agents/`, the current feature
pack, and only the technical documents needed for the task.

## Shared rules

- The CDC and explicit decisions are the source of truth for business rules.
- Prefer the smallest compatible, stable solution; justify added dependencies.
- Use server-side boundaries for secrets and privileged integrations.
- Do not create large catch-all files; keep responsibilities cohesive.
- A feature is not done until contract, implementation, UX and tests agree.
