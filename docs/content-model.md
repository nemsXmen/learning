# Content model

Markdown is the source of truth for knowledge (CDC §5, §89.5–§89.7). PostgreSQL only
mirrors what the platform needs to reason about content.

## Layout

```text
content/
  javascript/
    technology.yaml              name, order, description
    skills.yaml                  skill definitions and prerequisite edges (CDC §28)
    fundamentals/                a module directory
      module.yaml                title, order
      variables/                 a chapter directory
        lesson.md                frontmatter + body — the chapter
        quiz.yaml                practice questions (CDC §10 schema)
        test.yaml                chapter test (optional in V1)
        exercises/               one file per exercise (authored, ungraded in V1)
  typescript/
```

A chapter directory name is its slug. Its `id` is declared in frontmatter and must be
globally unique.

## Chapter frontmatter (required, CDC §7)

```yaml
---
id: javascript-closures            # globally unique, kebab-case
title: Comprendre les closures
slug: closures                     # unique within its technology
technology: javascript
level: intermediate                # beginner | intermediate | advanced | expert
module: scope
order: 4                           # position within the module
estimatedMinutes: 30
difficulty: 3                      # 1..5
xp: 100
prerequisites: [javascript-functions, javascript-scope]   # chapter ids
skills: [closures, lexical-environment, scope]            # skill ids in skills.yaml
tags: [javascript, functions, scope]
---
```

## Body structure (CDC §6, §74)

A chapter is rejected by `content:validate` if it is only prose. Required sections:

`Objectifs` · `Introduction` · `Concept` · `Exemple` · `Comment ça fonctionne` ·
`Erreurs fréquentes` · `À retenir` · `Exercices` · `Questions d'entretien`

`Attention` and `Résumé` are optional. Section names are matched as level-2 headings.

## Skill graph (`skills.yaml`)

```yaml
skills:
  - id: closures
    name: Closures
    importance: 5                # 1..5, feeds the engine priority formula
    requires: [scope, functions]
```

Edges must be acyclic and every referenced skill must exist. The graph — not the
chapter order — drives recommendations and unlocking (CDC §19, §27, §89.9).

## Quiz format — `quiz.yaml` (CDC §10)

```yaml
id: js-closures-q1
type: multiple_choice            # multiple_choice | multiple_answer | true_false |
                                 # predict_output | code_fix | open_ended | code_exercise
difficulty: 2
question: >
  Qu'est-ce qu'une closure ?
options:
  - Une fonction qui conserve accès à son environnement lexical
  - Une classe JavaScript
  - Une Promise
  - Un module ES
answer: [0]
explanation: >
  Une closure permet à une fonction d'accéder aux variables de son environnement
  lexical même après la fin de l'exécution de celui-ci.
skills: [closures]
```

`explanation` is mandatory for every question: a quiz without an explanation is
rejected, because the platform must never answer with a bare "Incorrect" (CDC §76).

`open_ended` and `code_exercise` items may be authored but are excluded from scoring
in V1 — see the open question in [decisions.md](./decisions.md).

## Validation (`pnpm content:validate`, CDC §44)

Fails the build on: duplicate ids or slugs, unknown prerequisite, unknown skill, cyclic
skill graph, missing required frontmatter field, missing required section, malformed
quiz, `answer` index out of range, missing explanation, broken relative link or asset,
an unreadable file or invalid YAML, and an empty content directory.

Line endings are normalised before parsing and before hashing, so a CRLF checkout
neither corrupts YAML values nor invalidates every cached render.

Output is a list of `path:line — problem`, so a content author fixes it without
reading code. CI runs it on every push (CDC §44).

## Versioning

Each file's content hash becomes its `content_version`. It keys the Redis render cache
and is stamped on every `quiz_attempt`, so a question edited after an attempt never
silently rewrites history.
