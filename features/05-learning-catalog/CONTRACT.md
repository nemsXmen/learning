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
  "parts": [{
    "slug": "functions", "title": "Functions — Le cœur du langage", "order": 3,
    "description": "…", "progressPercent": 60, "moduleSlugs": ["scope"]
  }],
  "modules": [{
    "slug": "scope", "title": "Scope & Execution", "order": 2, "part": "functions",
    "progressPercent": 60,
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

- `progressPercent` for a module is derived from its chapters, and for a part and a
  technology from the chapters they contain; no two levels ever disagree.
- `parts` is empty for a technology that declares none, and every `module.part` is then
  `null`. A part with an empty `moduleSlugs` is declared but not written yet.
- Lock state is computed server-side from `skill_mastery` and the skill graph.
- A locked chapter still exposes its title and reason, never its content.
