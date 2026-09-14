# Contract

## Inputs and outputs

`POST /quizzes/:quizId/attempts` → `201 { attemptId, contentVersion, questions:
[{ id, type, difficulty, question, options?, skills }] }` — no answers.

`POST /quizzes/attempts/:attemptId/submit` ← `{ answers: [{ questionId, given,
timeSpentMs }] }` → `200`
```json
{
  "attemptId": "…", "scorePercent": 80, "passed": true, "previousBestScore": 60,
  "results": [{
    "questionId": "js-closures-q1", "isCorrect": false,
    "given": [1], "correct": [0],
    "explanation": "Une closure permet à une fonction d'accéder …",
    "reviewSkills": [{ "id": "closures", "name": "Closures" }]
  }],
  "skillOutcomes": [{ "skillId": "closures", "correct": 3, "incorrect": 1 }]
}
```

`previousBestScore` is the best score on the quiz before this attempt, or `null` if it was
never passed. XP decides from it whether a pass is a first pass or a repeat; the screen
uses it to say so rather than leave a retake silently unpaid (CDC §26).

`GET /me/quizzes/:quizId/attempts` → attempt history with scores and timestamps.

## API or event boundary

Emits `quiz.attempt.graded { userId, attemptId, quizId, kind, source, scorePercent,
passed, previousBestScore, skillOutcomes, occurredAt }`, consumed synchronously by slices 10 and 11.

## Validation and errors

- Submitting an attempt that is already submitted → `409 ATTEMPT_ALREADY_SUBMITTED`.
- Submitting someone else's attempt → `404` (not `403`, to avoid disclosure).
- Unknown `questionId`, or an answer shape not matching the question type → `400
  INVALID_ANSWER`, naming the question.
- Attempt older than `ATTEMPT_TTL` → `410 ATTEMPT_EXPIRED`.
- Missing answers are graded as incorrect, never as skipped-and-ignored.

## Invariants

- Grading uses the `contentVersion` stamped at attempt start, so a content edit never
  rewrites a past attempt.
- An explanation is returned only for questions the user has already answered.
- `scorePercent` is derived from graded question types only, and the excluded types are
  reported so the UI can label them.
- An attempt is graded exactly once; the result is stored and replayed on re-read.
