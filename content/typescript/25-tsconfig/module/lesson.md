---
id: typescript-25-module
title: module
slug: module
technology: typescript
level: intermediate
module: 25-tsconfig
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-25-target]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Configurer l’option `module`
- Choisir ESM, CommonJS, etc.
- L’aligner avec le runtime / bundler

## Introduction

`module` définit le **système de modules** du code émis.

## Concept

```json
{
  "compilerOptions": {
    "module": "ESNext"
  }
}
```

Valeurs : `CommonJS`, `ES2015`, `ES2020`, `ESNext`, `Node16`, `NodeNext`…

## Exemple

Node moderne → souvent `Node16` / `NodeNext`. Bundler → souvent `ESNext`.

## Comment ça fonctionne

TypeScript réécrit `import`/`export` selon le format cible (ex. `require` pour CommonJS).

## Erreurs fréquentes

- module incompatible avec moduleResolution
- ESM dans un contexte CJS sans "type": "module"

## À retenir

- `module` = format d’émission des modules
- Aligner runtime + package.json
- Pair avec moduleResolution

## Exercices

1. Configure module sur ESNext.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "module": "ESNext" } }
   ```
   :::

## Questions d'entretien

1. Que contrôle l’option `module` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le système de modules du JavaScript émis (ESM, CommonJS, Node16…). Il doit être cohérent avec le runtime et `moduleResolution`.
   :::
