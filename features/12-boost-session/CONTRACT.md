# Contract

## Inputs and outputs

`GET /me/boost/preview` → 200
```json
{ "available": true, "targetSkills": [{ "id": "event-loop", "name": "Event Loop",
  "mastery": 43, "reason": "Score de 48% et 3 échecs sur cette compétence" }],
  "suggestedMinutes": 8 }
```

`POST /me/boost/sessions` ← `{ availableMinutes: 5|10|15, skillIds?: string[] }`
→ `201 { sessionId, targetSkillIds, estimatedMinutes, steps: [{ index, kind, ref,
estimatedMinutes }], reason }`

`GET /me/boost/sessions/:id` → the session with `currentStepIndex` and `status`.

`POST /me/boost/sessions/:id/steps/:index` ← the step answer → the step result, reusing
the slice 08 feedback shape.

`POST /me/boost/sessions/:id/complete` → `200 { scorePercent, masteryDeltas:
[{ skillId, name, delta }], xpAwarded }`

## API or event boundary

Emits `boost.session.completed { userId, sessionId, scorePercent, skillOutcomes,
occurredAt }`, consumed by slices 10 and 11.

## Validation and errors

- `availableMinutes` must be one of the allowed values → `400 INVALID_DURATION`.
- No weak or due skill → `200 { available: false, reason }`, never an error.
- Steps must be answered in order → `409 STEP_OUT_OF_ORDER`.
- Another user's session → `404`. An abandoned session past TTL → `410 SESSION_EXPIRED`.

## Invariants

- The plan is generated once at creation and stored; it does not change mid-session.
- Total estimated minutes never exceed `availableMinutes`.
- A session is completed once; XP and mastery are applied exactly once.
- Every target skill carries the engine's reason for being targeted.
