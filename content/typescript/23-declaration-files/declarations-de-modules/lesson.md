---
id: typescript-23-declarations-de-modules
title: Déclarations de modules
slug: declarations-de-modules
technology: typescript
level: intermediate
module: 23-declaration-files
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-23-declarations-globales]
skills: [declaration-files]
tags: [typescript, modules]
---

## Objectifs

- Déclarer un module ambient
- Typer les imports d’une lib JS sans types
- Utiliser `declare module`

## Introduction

`declare module` décrit les exports d’un module non typé.

## Concept

```ts
// legacy-lib.d.ts
declare module "legacy-lib" {
  export function start(): void;
  export function stop(): void;
  export const version: string;
}
```

```ts
import { start, version } from "legacy-lib";
```

## Exemple – modules wildcard

```ts
declare module "*.css" {
  const classes: { [key: string]: string };
  export default classes;
}
```



## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

TypeScript résout l’import vers la déclaration ambient du module. Le runtime charge toujours le JS réel.

## Erreurs fréquentes

- Mauvais nom de module (doit matcher le spécificateur d’import)
- Oublier les exports nommés vs default

## À retenir

- `declare module "name" { ... }`
- Wildcard pour assets (css, svg…)
- Débloque les imports de libs JS

## Exercices

1. Déclare un module `"utils-js"` avec `export function clamp(n: number, min: number, max: number): number`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   declare module "utils-js" {
     export function clamp(n: number, min: number, max: number): number;
   }
   ```
   :::

## Questions d'entretien

1. Comment types-tu une lib JavaScript sans `@types` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En créant un fichier `.d.ts` avec `declare module "nom-du-package" { ... }` décrivant les exports, placé dans un dossier inclus par le projet TypeScript.
   :::
