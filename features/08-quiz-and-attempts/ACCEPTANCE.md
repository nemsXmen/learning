# Acceptance criteria

- [x] Questions are served without answers, proven by a recursive assertion
- [x] Every supported question type is graded correctly, including partial answers
- [x] Wrong answers return given, correct, explanation and review skills
- [x] Attempts are single-submit, version-stamped and replayable
- [x] `quiz.attempt.graded` carries accurate per-skill outcomes
- [x] Loading, empty, error, success and disabled states implemented
- [x] Quiz is fully keyboard operable; correctness is not colour-only; axe passes -
      every question answered and the attempt submitted by keyboard alone, each
      result reads "✓ Correct" or "✕ Incorrect" as text, axe clean in both themes
      (`pnpm test:a11y`)
- [x] Ungraded question types are labelled rather than silently dropped
- [x] Automated tests pass
