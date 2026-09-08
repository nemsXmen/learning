# Contract

## Inputs and outputs

`GET /me/dashboard` → 200
```json
{
  "user": { "displayName": "Nehemia", "level": 12, "xp": 2450, "dailyMinutesTarget": 30 },
  "streak": { "currentDays": 7, "activeToday": false },
  "overallProgressPercent": 68,
  "continue": { "technologySlug": "javascript", "chapterSlug": "closures",
                "title": "Comprendre les closures", "progressPercent": 72 },
  "nextBestAction": { "type": "BOOST", "label": "Renforcer Event Loop",
                      "href": "/boost", "estimatedMinutes": 8,
                      "reason": "Ton score est de 48% et tu as échoué 3 fois sur cette compétence" },
  "attention": [{ "skillId": "event-loop", "name": "Event Loop", "mastery": 43,
                  "reason": "…" }],
  "todayPlan": [{ "kind": "REVIEW", "label": "Review Closures", "estimatedMinutes": 5,
                  "href": "/boost" }],
  "technologies": [{ "slug": "javascript", "name": "JavaScript", "progressPercent": 78 }]
}
```

## Validation and errors

- Unauthenticated → `401`; the page redirects to `/login?next=/dashboard`.
- A panel whose source fails is returned as `null` with a `degraded` list naming it;
  the dashboard still renders.

## Invariants

- `nextBestAction` is always present and always carries a non-empty `reason`.
- `todayPlan` total minutes never exceed the user's daily target.
- Every figure shown is derived from a persisted fact, never estimated in the UI.
