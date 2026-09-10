# Acceptance criteria

- [x] Questions are served without answers, proven by a recursive assertion
- [x] Every supported question type is graded correctly, including partial answers
- [x] Wrong answers return given, correct, explanation and review skills
- [x] Attempts are single-submit, version-stamped and replayable
- [x] `quiz.attempt.graded` carries accurate per-skill outcomes
- [x] Loading, empty, error, success and disabled states implemented
- [ ] Quiz is fully keyboard operable; correctness is not colour-only; axe passes -
      built with real radio/checkbox groups in a fieldset and text labels for
      correctness, but no axe scan or keyboard audit has been run
- [x] Ungraded question types are labelled rather than silently dropped
- [x] Automated tests pass
