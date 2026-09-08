# Requirements

## Goal

A learner answers questions, is graded immediately and fairly, and learns something
from every mistake instead of seeing a bare "Incorrect".

## Scope

### Must

- Start an attempt for a chapter quiz or chapter test; serve questions without answers.
- Grade on submit, server-side, against `content/` at the recorded `contentVersion`.
- Per-question feedback: the given answer, the correct answer, the authored explanation,
  and the skills to review (CDC §76).
- Persist `quiz_attempt` and `attempt_answer`, including per-question time.
- Emit `quiz.attempt.graded` carrying per-skill success and failure counts.
- Quiz UI: one question at a time, keyboard answerable, immediate result screen.
- Retry an attempt; history is kept, the best and latest scores are both retrievable.

### Must not

- No grading in the browser and no answer key in a page payload.
- No mastery update, XP award or streak change here — those consume the event.
- No adaptive difficulty beyond selecting from the authored bands.
