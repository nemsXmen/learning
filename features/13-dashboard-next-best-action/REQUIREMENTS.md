# Requirements

## Goal

A learner opens the platform and, within one screen and no decisions, knows what to do
next and why.

## Scope

### Must

- `/dashboard` as a Server Component composing: greeting, streak, XP and level, overall
  progress (CDC §20), a Continue card, a Boost card listing skills needing attention,
  and today's plan sized to the user's daily minutes target (CDC §35).
- One primary next best action, produced by `recommendNextAction` and shown with the
  engine's reason (CDC §66, §81).
- A progress page (`/progress`) with per-technology journey and weak areas (CDC §79).
- `noindex` on all private routes.
- A single aggregation endpoint so the dashboard is one round trip, not six.

### Must not

- No recommendation logic in `apps/web`.
- No motivational copy that is not backed by data (CDC §78).
- No blocking of the dashboard on an optional panel's failure.
