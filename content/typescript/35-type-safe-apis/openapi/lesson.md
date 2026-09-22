---
id: typescript-35-openapi
title: OpenAPI
slug: openapi
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-35-contract-first-development]
skills: [api]
tags: [typescript, api, openapi]
---

## Objectifs

- Comprendre OpenAPI comme contrat
- Générer types TypeScript
- Lier validation et doc

## Introduction

**OpenAPI** (Swagger) décrit REST APIs de façon standard.

## Concept

```yaml
# extrait
paths:
  /users/{id}:
    get:
      parameters:
        - name: id
          in: path
          schema: { type: string }
      responses:
        "200":
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
```

```bash
npx openapi-typescript openapi.yaml -o types/api.ts
```

## Exemple

Outils : openapi-typescript, orval, openapi-generator.

## Comment ça fonctionne

La spec alimente doc, mocks, clients typés et parfois validation (JSON Schema).

## Erreurs fréquentes

- Spec incomplète (erreurs non documentées)
- Types générés non utilisés

## À retenir

- Spec YAML/JSON
- Codegen TS
- Doc + types + tests

## Exercices

1. Outil courant pour générer des types TS depuis OpenAPI ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   openapi-typescript (ou orval, openapi-generator…).
   :::

## Questions d'entretien

1. Comment OpenAPI aide-t-il TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En fournissant un contrat machine-readable d’où l’on génère types et clients TS, alignant front, back et documentation sur la même source.
   :::
