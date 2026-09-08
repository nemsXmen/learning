# Feature: Quiz and attempts

Slice 08. Serving questions, grading server-side, and returning the pedagogical
feedback CDC §76 demands after every wrong answer.

Depends on: 03, 04, 07. Blocks: 10, 11, 12.
V1 grades multiple choice, multiple answer, true/false and output prediction; open-ended
and code items are excluded — see the open question in `docs/decisions.md`.
