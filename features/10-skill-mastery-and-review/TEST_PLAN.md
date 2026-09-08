# Test plan

## Unit

- Event-to-engine mapping: skill outcomes become the correct engine input.
- Chapter completion contributes the documented lower weight.
- Unknown skill in an event is skipped without failing the attempt.

## Integration

- A graded attempt updates mastery and `next_review_at` in the same transaction as the
  attempt; a rollback leaves neither.
- `GET /me/mastery/weak` returns skills ordered by engine priority with reasons.
- `GET /me/reviews/due` respects the clock and excludes not-yet-due skills.
- Replay from history reproduces the live state byte for byte.

## End to end

- Fail a quiz on one skill, see the weak-skill panel list it with an explanation, and
  see it scheduled for review.

## Edge cases and regression risks

- A skill taught by two chapters in different modules.
- A first-ever attempt with no prior mastery row.
- A parameter change followed by a replay while a user is mid-attempt.
