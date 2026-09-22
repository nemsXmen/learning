---
id: typescript-30-esm
title: ESM
slug: esm
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-30-build-de-librairie]
skills: [npm]
tags: [typescript, npm, esm]
---

## Objectifs

- Publier / consommer des modules ESM
- Configurer package.json pour ESM
- Éviter les pièges d’interop

## Introduction

**ESM** (`import`/`export`) est le standard moderne des modules JS.

## Concept

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

```ts
import { add } from "my-lib";
```

## Exemple

Extensions `.mjs` ou `"type": "module"` + `.js` émis en syntaxe ESM.

## Comment ça fonctionne

Node et les bundlers résolvent la condition `import`. TypeScript avec `module: NodeNext` vérifie la compatibilité.

## Erreurs fréquentes

- dual package hazard (CJS/ESM mal géré)
- require() d’un package purement ESM

## À retenir

- type module / exports.import
- NodeNext
- Attention dual package

## Exercices

1. Quel champ package.json active ESM par défaut pour .js ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `"type": "module"`
   :::

## Questions d'entretien

1. Comment indiques-tu qu’un package est ESM ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Via `"type": "module"` et/ou la condition `import` dans `exports`, avec des fichiers émis en syntaxe ESM, et des types alignés.
   :::
