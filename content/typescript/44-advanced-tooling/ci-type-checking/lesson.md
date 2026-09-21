---
id: typescript-44-ci-type-checking
title: CI type checking
slug: ci-type-checking
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-44-prettier]
skills: [tooling]
tags: [typescript, tooling, ci]
---

## Objectifs

- Gate tsc en CI
- Séparer build et typecheck
- Caches

## Introduction

Le **typecheck CI** empêche de merger du code qui ne type pas.

## Concept

```yaml
# idée GitHub Actions
- run: npx tsc -p tsconfig.json --noEmit
- run: npx eslint .
- run: npx prettier --check .
```

## Exemple

Job parallel : typecheck / lint / test.

## Comment ça fonctionne

`--noEmit` = diagnostics only. Cache tsbuildinfo si incremental.

## Erreurs fréquentes

- Typecheck seulement en local
- CI sur une autre version de TypeScript

## À retenir

- tsc --noEmit
- Même version TS
- Cache

## Exercices

1. Flag tsc pour checker sans émettre ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `--noEmit`
   :::

## Questions d'entretien

1. Pourquoi type-checker en CI ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour garantir que la branche mergeable compile au niveau des types, indépendamment de la config locale d’un développeur, et bloquer les régressions tôt.
   :::
