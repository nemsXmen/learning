---
id: typescript-44-code-generation
title: Code generation
slug: code-generation
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-44-language-service]
skills: [tooling]
tags: [typescript, tooling]
---

## Objectifs

- Générer types et clients
- OpenAPI / GraphQL / Prisma
- Intégrer au build

## Introduction

La **codegen** produit du TypeScript depuis une source de vérité.

## Concept

Exemples :
- `openapi-typescript` → types API
- GraphQL Code Generator
- Prisma `prisma generate`
- `orval`, `swagger-typescript-api`

## Exemple

```bash
npx openapi-typescript openapi.yaml -o src/api/types.ts
```

## Comment ça fonctionne

Spec → AST/texte TS. CI régénère et échoue si drift (diff).

## Erreurs fréquentes

- Types générés commités non régénérés
- Éditer à la main les fichiers générés

## À retenir

- Source de vérité externe
- Script generate
- CI drift check

## Exercices

1. Pourquoi ne pas éditer à la main un fichier généré ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   La prochaine génération écrase les changements.
   :::

## Questions d'entretien

1. Avantage de générer des types depuis OpenAPI ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Une seule source de vérité pour le contrat API : clients et serveurs restent alignés, avec moins de drift manuel.
   :::
