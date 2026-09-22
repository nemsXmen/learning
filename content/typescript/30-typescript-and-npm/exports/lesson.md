---
id: typescript-30-exports
title: exports
slug: exports
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 7
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-30-champ-types]
skills: [npm]
tags: [typescript, npm]
---

## Objectifs

- Utiliser le champ `exports` de package.json
- Déclarer des conditions `types` / `import` / `require`
- Comprendre la résolution moderne

## Introduction

Le champ **`exports`** contrôle les points d’entrée du package (Node + outils modernes).

## Concept

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  }
}
```

## Exemple

Permet des sous-chemins stables (`pkg/utils`) sans exposer toute l’arborescence `dist`.

## Comment ça fonctionne

Les conditions sont évaluées selon le contexte (ESM vs CJS, types pour TypeScript). L’ordre des conditions peut importer.

## Erreurs fréquentes

- Oublier la condition `types`
- Exposer trop de chemins internes

## À retenir

- exports = API publique
- conditions types/import/require
- Sous-chemins contrôlés

## Exercices

1. Ajoute une condition types pour l’entrée principale.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } } }
   ```
   :::

## Questions d'entretien

1. Pourquoi mettre `types` dans `exports` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour que TypeScript résolve les déclarations correctement dans le modèle d’exports moderne, en parallèle des conditions `import`/`require` pour le runtime.
   :::
