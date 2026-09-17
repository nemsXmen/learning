---
id: typescript-11-strategie-stricte-sans-any
title: Stratégie stricte sans any
slug: strategie-stricte-sans-any
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 10
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-11-void-vs-never]
skills: [any-unknown-never]
tags: [typescript, strict, any]
---

## Objectifs

- Mettre en place une stratégie « zero any »
- Configurer le compilateur en conséquence
- Gérer les exceptions (interop, migration)

## Introduction

Une base de code TypeScript saine minimise ou élimine `any`.

## Concept

### Config recommandée

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Règles d’équipe

1. Interdire `any` explicite (ESLint `@typescript-eslint/no-explicit-any`)
2. Préférer `unknown` pour l’inconnu
3. Typer les frontières (API, JSON, DOM) avec validation
4. Isoler les éventuels `any` restants (commentés + ticket)

### Migration

- Remplacer progressivement les `any` par des types précis ou `unknown`
- Commencer par les modules critiques

## Exemple

```ts
// Avant
function loadConfig(): any {
  return JSON.parse(readFile("config.json"));
}

// Après
function loadConfig(): unknown {
  return JSON.parse(readFile("config.json"));
}
// + validation Zod / type guard
```

## Comment ça fonctionne

La discipline collective + les options strictes + le linting maintiennent la qualité du typage dans le temps.

## Erreurs fréquentes

- Autoriser `any` « temporaire » sans suivi
- Désactiver `strict` pour gagner du temps

## À retenir

- `strict` + `noImplicitAny` + lint no-explicit-any
- `unknown` par défaut pour l’inconnu
- Isoler et réduire les exceptions

## Exercices

1. Liste 3 actions concrètes pour réduire les `any` dans un projet existant.

   :::solution
   Activer noImplicitAny / strict ; ajouter la règle ESLint no-explicit-any ; remplacer les retours JSON par unknown + validation.
   :::

## Questions d'entretien

1. Quelle stratégie recommandes-tu pour éviter les `any` dans un projet TypeScript ?

   :::reponse
   Activer le mode strict (notamment noImplicitAny), interdire any explicite via ESLint, utiliser unknown pour les données inconnues, valider les frontières runtime, et isoler/documenter les rares exceptions restantes.
   :::
