---
id: typescript-24-import
title: import
slug: import
technology: typescript
level: intermediate
module: 24-modules
order: 2
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-24-es-modules]
skills: [modules]
tags: [typescript, modules]
---

## Objectifs

- Utiliser les différentes formes d’`import`
- Importer des valeurs et des types
- Comprendre les chemins relatifs / packages

## Introduction

`import` charge des exports depuis un autre module.

## Concept

```ts
import { add } from "./math";
import * as Math from "./math";
import subtract from "./subtract";
import { type User, createUser } from "./user";
```

## Exemple

```ts
import lodash from "lodash";
import { readFile } from "fs/promises";
```

## Comment ça fonctionne

TypeScript résout le spécificateur (relatif, package, path mapping) selon `moduleResolution`.

## Erreurs fréquentes

- Extension `.ts` / `.js` selon la config (NodeNext…)
- Imports circulaires

## À retenir

- Named, default, namespace imports
- Résolution via tsconfig
- Séparer type-only quand utile

## Exercices

1. Importe `add` depuis `./math`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   import { add } from "./math";
   ```
   :::

## Questions d'entretien

1. Quelles formes d’import ES connais-tu ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Named (`{ x }`), default (`x`), namespace (`* as ns`), et les variantes type-only (`import type` / `import { type x }`).
   :::
