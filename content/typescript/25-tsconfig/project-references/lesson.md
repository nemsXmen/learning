---
id: typescript-25-project-references
title: Project references
slug: project-references
technology: typescript
level: advanced
module: 25-tsconfig
order: 17
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-25-paths]
skills: [tsconfig]
tags: [typescript, tsconfig, monorepo]
---

## Objectifs

- Comprendre les project references
- Structurer un monorepo TypeScript
- Utiliser `composite` et `references`

## Introduction

Les **project references** permettent de découper un codebase en plusieurs projets TypeScript liés.

## Concept

```json
// tsconfig.json (solution)
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}
```

```json
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "dist"
  }
}
```

## Exemple

`tsc -b` build le graphe de projets dans le bon ordre.

## Comment ça fonctionne

Chaque sous-projet produit des déclarations ; les dépendants consomment les `.d.ts` plutôt que les sources, accélérant les builds incrémentaux.

## Erreurs fréquentes

- Oublier `composite: true`
- Références circulaires entre projets

## À retenir

- composite + references
- `tsc -b` pour build orchestré
- Idéal monorepos

## Exercices

1. Cite deux options souvent requises pour un projet référencé.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `composite: true` et généralement `declaration: true`.
   :::

## Questions d'entretien

1. À quoi servent les TypeScript project references ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À découper une solution en plusieurs projets compilables séparément, avec un graphe de dépendances (`references`) et des builds incrémentaux (`tsc -b`), typiquement en monorepo.
   :::
