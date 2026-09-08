# Contract

## Inputs and outputs

`GET /learn/technologies` → 200
```json
[{ "slug": "javascript", "name": "JavaScript", "progressPercent": 78,
   "moduleCount": 12, "chapterCount": 86, "masteredSkillCount": 21, "skillCount": 40 }]
```

`GET /learn/technologies/:slug` → 200
```json
{
  "slug": "javascript", "name": "JavaScript", "progressPercent": 78,
  "modules": [{
    "slug": "scope", "title": "Scope & Execution", "order": 2, "progressPercent": 60,
    "chapters": [{
      "id": "javascript-closures", "slug": "closures", "title": "Comprendre les closures",
      "order": 4, "estimatedMinutes": 30, "difficulty": 3, "xp": 100,
      "status": "IN_PROGRESS", "progressPercent": 72,
      "locked": false, "lockReason": null
    }]
  }],
  "continue": { "chapterSlug": "closures", "moduleSlug": "scope", "progressPercent": 72 }
}
```

Locked chapter example: `"locked": true, "lockReason": { "code": "PREREQUISITE_SKILLS",
"skills": [{ "id": "scope", "name": "Scope", "mastery": 34, "required": 60 }] }`.

`GET /learn/technologies/:slug/skills` → the skill graph with per-user mastery.

## Validation and errors

- Unknown or unpublished technology → `404 TECHNOLOGY_NOT_FOUND`.
- Unauthenticated → `401`.
- All responses are scoped to the authenticated user; no user id is accepted as input.

## Invariants

- `progressPercent` for a module is derived from its chapters, and for a technology
  from its modules; the three never disagree.
- Lock state is computed server-side from `skill_mastery` and the skill graph.
- A locked chapter still exposes its title and reason, never its content.
