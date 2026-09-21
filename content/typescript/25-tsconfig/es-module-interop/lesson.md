---
id: typescript-25-es-module-interop
title: esModuleInterop
slug: es-module-interop
technology: typescript
level: intermediate
module: 25-tsconfig
order: 13
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-25-no-unused-parameters]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Comprendre `esModuleInterop`
- Importer des modules CJS plus naturellement
- L’associer à `allowSyntheticDefaultImports`

## Introduction

`esModuleInterop` améliore l’interopérabilité entre ESM et CommonJS.

## Concept

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

Permet :

```ts
import fs from "fs";
// plutôt que import * as fs from "fs"
```

pour beaucoup de modules CJS.

## Exemple

Active aussi des helpers d’interop à l’émission selon le contexte.

## Comment ça fonctionne

Ajuste la sémantique d’import default pour coller aux attentes ESM tout en consommant du CJS.

## Erreurs fréquentes

- L’activer sans comprendre les différences default / namespace

## À retenir

- Interop CJS ↔ ESM
- Recommandé dans la plupart des projets
- Souvent avec allowSyntheticDefaultImports

## Exercices

1. Active esModuleInterop.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "esModuleInterop": true } }
   ```
   :::

## Questions d'entretien

1. À quoi sert `esModuleInterop` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À faciliter l’import de modules CommonJS via une syntaxe d’import default ESM plus naturelle, en ajustant la sémantique d’interopérabilité.
   :::
