---
id: typescript-24-named-exports
title: Named exports
slug: named-exports
technology: typescript
level: intermediate
module: 24-modules
order: 4
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-24-export]
skills: [modules]
tags: [typescript, modules]
---

## Objectifs

- Maîtriser les named exports
- Les importer par nom
- Les renommer à l’import / export

## Introduction

Les **named exports** associent un nom stable à chaque export.

## Concept

```ts
// math.ts
export function add(a: number, b: number) {
  return a + b;
}
export function sub(a: number, b: number) {
  return a - b;
}

// main.ts
import { add, sub as subtract } from "./math";
```

## Exemple

```ts
export { add as sum };
```

## Comment ça fonctionne

Le consommateur doit utiliser les noms exportés (ou des alias). Tree-shaking friendly.

## Erreurs fréquentes

- Confondre avec default
- Mauvais nom à l’import

## À retenir

- Plusieurs named exports par module
- Import { nom }
- Alias avec `as`

## Exercices

1. Exporte deux constantes `HOST` et `PORT` en named exports.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export const HOST = "localhost";
   export const PORT = 3000;
   ```
   :::

## Questions d'entretien

1. Quel avantage des named exports pour le tree-shaking ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les bundlers peuvent plus facilement éliminer les exports non utilisés, car chaque binding est distinct et analysable statiquement.
   :::
