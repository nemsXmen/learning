---
id: typescript-24-es-modules
title: ES Modules
slug: es-modules
technology: typescript
level: intermediate
module: 24-modules
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: []
skills: [modules]
tags: [typescript, modules, esm]
---

## Objectifs

- Comprendre les ES Modules
- Voir le lien avec TypeScript
- Distinguer ESM et scripts / CommonJS

## Introduction

TypeScript s’appuie sur le système de **modules ES** (`import` / `export`) comme modèle principal.

## Concept

Un fichier avec `import` ou `export` est un **module**. Sinon, c’est un script (scope global).

```ts
// math.ts — module
export function add(a: number, b: number) {
  return a + b;
}

// main.ts
import { add } from "./math";
```

## Exemple

`tsconfig` contrôle l’émission : `module: "ESNext" | "CommonJS" | ...`.

## Comment ça fonctionne

TypeScript type-check les modules selon les résolutions d’import. Le runtime (Node, navigateur, bundler) charge le format émis.

## Erreurs fréquentes

- Mélanger global et modules sans le vouloir
- Mauvais `module` / `moduleResolution` dans tsconfig

## À retenir

- import/export → module
- ESM = modèle standard TS
- Config module critique

## Exercices

1. Transforme un fichier avec une fonction `add` en module exportant cette fonction.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export function add(a: number, b: number) {
     return a + b;
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qui fait d’un fichier TypeScript un module ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   La présence d’au moins un `import` ou `export` de premier niveau. Sinon, le fichier est traité comme un script au scope global.
   :::
