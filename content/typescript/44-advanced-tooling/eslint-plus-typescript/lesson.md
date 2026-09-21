---
id: typescript-44-eslint-plus-typescript
title: ESLint + TypeScript
slug: eslint-plus-typescript
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-43-architecture-du-compilateur]
skills: [tooling]
tags: [typescript, tooling, eslint]
---

## Objectifs

- Configurer typescript-eslint
- Règles type-aware
- Éviter les conflits Prettier

## Introduction

**ESLint** analyse le style et les bugs ; avec TypeScript il devient type-aware.

## Concept

```js
// eslint.config.js (flat)
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    }
  }
);
```

## Exemple

Règles utiles : `no-floating-promises`, `no-misused-promises`, `consistent-type-imports`.

## Comment ça fonctionne

Le parser TS + checker optionnel. Plus lent mais plus précis.

## Erreurs fréquentes

- project: true sans tsconfig valide
- Doubler les règles de formatage (laisser à Prettier)

## À retenir

- typescript-eslint
- Type-checked rules
- CI lint

## Exercices

1. Règle pour les Promises non await ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `@typescript-eslint/no-floating-promises`
   :::

## Questions d'entretien

1. Pourquoi activer les règles type-aware ESLint ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Elles s’appuient sur le type checker pour attraper des bugs (promises flottantes, mauvais await, etc.) que le lint syntaxique seul rate.
   :::
