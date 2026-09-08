# Requirements

## Goal

A learner with ten spare minutes gets a session that targets exactly what is weakest or
most at risk of being forgotten, and sees precisely what it moved.

## Scope

### Must

- Generate a plan from `generateBoostSession` for the user's weak and due skills,
  fitted to a chosen duration (5, 10 or 15 minutes).
- Run the plan step by step: quick question → explanation → example → question →
  exercise → mini-test (CDC §17), reusing the quiz components from slice 08.
- Score the session and report per-skill mastery deltas (CDC §80).
- Persist `boost_session` with its plan, status, score and deltas; resume an
  interrupted session.
- Pages `/boost` (entry, showing target skills and the reason) and
  `/boost/session/[id]` (the run).
- Award boost XP once per completed session.

### Must not

- No plan built in the browser; the plan comes from the engine through the API.
- No session exceeding the chosen duration budget.
- No boost offered when nothing is weak or due — say so instead.
