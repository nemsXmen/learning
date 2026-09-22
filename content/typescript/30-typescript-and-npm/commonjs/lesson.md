---
id: typescript-30-commonjs
title: CommonJS
slug: commonjs
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-30-esm]
skills: [npm]
tags: [typescript, npm, commonjs]
---

## Objectifs

- Publier / consommer du CommonJS
- Voir require / module.exports
- Coexister avec ESM

## Introduction

**CommonJS** (`require` / `module.exports`) reste répandu dans l’écosystème Node.

## Concept

```json
{
  "main": "./dist/index.cjs",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.cjs",
      "import": "./dist/index.mjs"
    }
  }
}
```

```js
const { add } = require("my-lib");
```

## Exemple

Beaucoup de libs publient **dual** : CJS + ESM pour maximiser la compatibilité.

## Comment ça fonctionne

La condition `require` sert les consommateurs CJS. TypeScript peut émettre CJS via `module: CommonJS` ou un bundler multi-format.

## Erreurs fréquentes

- default export CJS mal interopéré en ESM (besoin esModuleInterop)
- dual package mal configuré

## À retenir

- main / exports.require
- Dual publish fréquent
- Interop à tester

## Exercices

1. Quelle condition exports sert require() ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `"require"`
   :::

## Questions d'entretien

1. Pourquoi beaucoup de libs publient CJS et ESM ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour rester compatibles à la fois avec l’écosystème Node historique (require) et les projets modernes ESM, en exposant les deux via `exports`.
   :::
