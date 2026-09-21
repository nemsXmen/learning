---
id: typescript-44-project-references
title: Project references
slug: tooling-project-references
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-44-incremental-compilation]
skills: [tooling]
tags: [typescript, tooling, monorepo]
---

## Objectifs

- Découper en projets TS
- references dans tsconfig
- tsc -b

## Introduction

Les **project references** structurent les builds multi-packages.

## Concept

```json
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
    "declaration": true
  }
}
```

## Exemple

Monorepo : core → api → web, builds ordonnés.

## Comment ça fonctionne

`composite` + `declaration` permettent de référencer les sorties typées. `tsc -b` build le graphe.

## Erreurs fréquentes

- Oublier composite
- Cycles de references

## À retenir

- composite
- references
- tsc -b

## Exercices

1. Option requise sur un projet référencé ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `composite: true` (souvent avec declaration).
   :::

## Questions d'entretien

1. Intérêt des project references ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Découper un gros codebase en projets compilables indépendamment, avec un ordre de build clair et un cache incrémental par projet — idéal monorepo.
   :::
