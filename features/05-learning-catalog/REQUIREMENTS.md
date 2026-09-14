# Requirements

## Goal

A learner sees what a technology contains, how far along they are, what is next, and
what is still locked and why.

## Scope

### Must

- API: list technologies with per-user progress; technology detail with modules,
  chapters, counts and lock state; skill graph for a technology.
- Lock resolution: a chapter is unlocked when every prerequisite skill reaches the
  unlock threshold (30 % — read the prerequisite chapter, then pass its test once); the
  reason for a lock is returned, never inferred by the UI.
- Pages `/learn` (technology grid) and `/learn/[technology]` (roadmap + module list).
- Roadmap visualisation of the module sequence (CDC §21).

### Must not

- No chapter body — that is slice 06.
- No lock logic duplicated in `apps/web`.
- No technology hardcoded in code; the list comes from synced content.
