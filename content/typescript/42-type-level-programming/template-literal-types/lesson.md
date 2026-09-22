---
id: typescript-42-template-literal-types
title: Template literal types
slug: type-level-template-literal-types
technology: typescript
level: advanced
module: 42-type-level-programming
order: 5
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-mapped-types]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Composer des string types
- Uppercase / Capitalize helpers
- Patterns d’events et routes

## Introduction

Les **template literal types** manipulent des types string.

## Concept

```ts
type EventName = "click" | "focus";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus"

type Route = `/users/${string}`;
```

## Exemple

```ts
type Prop = "color" | "size";
type CSSVar = `--${Prop}`; // "--color" | "--size"
```

## Comment ça fonctionne

Interpolation de littéraux et unions → union de toutes les combinaisons.

## Erreurs fréquentes

- string trop large (perd les littéraux)
- Explosion combinatoire d’unions

## À retenir

- `...${T}...`
- Intrinsic string types
- Unions distribuées

## Exercices

1. `on${Capitalize<"load">}` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   "onLoad"
   :::

## Questions d'entretien

1. Cas d’usage des template literal types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Noms d’handlers (`onClick`), routes, CSS vars, clés API dérivées — tout pattern de strings structuré que le type-checker peut valider.
   :::
