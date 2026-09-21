---
id: typescript-29-modules-nodejs
title: Modules Node.js
slug: modules-nodejs
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-29-eventemitter]
skills: [nodejs]
tags: [typescript, nodejs, modules]
---

## Objectifs

- Distinguer CJS et ESM sous Node + TS
- Configurer module / moduleResolution
- Utiliser createRequire si besoin

## Introduction

Node supporte CommonJS et ES Modules. TypeScript doit être aligné.

## Concept

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

```ts
// ESM
import fs from "fs/promises";
export function main() {}

// CJS
const fs = require("fs");
module.exports = { main };
```

## Exemple

`"type": "module"` dans package.json active ESM par défaut.

## Comment ça fonctionne

NodeNext respecte les règles Node (extensions, package exports). Les mélanges CJS/ESM demandent de la prudence.

## Erreurs fréquentes

- module ESNext sans résolution Node adaptée
- Imports sans extension quand Node l’exige

## À retenir

- NodeNext pour Node moderne
- package.json "type"
- Cohérence CJS/ESM

## Exercices

1. Quelle paire d’options TS recommander pour Node 20 ESM ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `"module": "NodeNext", "moduleResolution": "NodeNext"`
   :::

## Questions d'entretien

1. Comment configures-tu TypeScript pour un projet Node ESM moderne ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Souvent `module` et `moduleResolution` en `NodeNext` (ou Node16), `"type": "module"` dans package.json, et le respect des extensions / exports de packages.
   :::
