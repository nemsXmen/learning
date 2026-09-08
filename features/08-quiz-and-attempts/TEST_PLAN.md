# Test plan

## Unit

- Grader per question type: multiple choice, multiple answer (order-independent, partial
  answers wrong), true/false, output prediction (whitespace-normalised comparison).
- Score computation excludes ungraded types and reports the exclusion.
- Missing answer counts as incorrect.

## Integration

- Attempt payload contains no `answer` and no `explanation` at any depth.
- Submit returns explanations only for answered questions.
- Double submit → 409; foreign attempt → 404; expired attempt → 410.
- Grading uses the stamped `contentVersion` after the content file changes.
- `quiz.attempt.graded` is emitted once with correct per-skill counts.

## End to end

- Take a quiz, answer wrongly, see the four-part feedback, retry, see history.
- Keyboard-only completion of a full quiz.

## Edge cases and regression risks

- All questions unanswered; all correct; a single-question quiz.
- Content edited mid-attempt.
- Very slow submit with a duplicate click.
