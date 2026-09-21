---
id: typescript-23-at-types
title: "@types"
slug: at-types
technology: typescript
level: intermediate
module: 23-declaration-files
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-23-types-declares]
skills: [declaration-files]
tags: [typescript, definitelytyped]
---

## Objectifs

- Comprendre le scope `@types/*`
- Installer des types communautaires
- Savoir où TypeScript les cherche

## Introduction

**DefinitelyTyped** publie des packages `@types/nom-lib` contenant des `.d.ts` pour des libs JS populaires.

## Concept

```bash
npm install --save-dev @types/lodash
npm install --save-dev @types/node
```

TypeScript résout automatiquement les types depuis `node_modules/@types`.

## Exemple

```ts
import * as _ from "lodash";
// typé grâce à @types/lodash
```

## Comment ça fonctionne

Avec les options par défaut, le compilateur inclut les types de `@types`. On peut restreindre via `compilerOptions.types` dans tsconfig.

## Erreurs fréquentes

- Versions de `@types` désynchronisées de la lib
- Types obsolètes pour une API récente

## À retenir

- `@types/pkg` = types communautaires
- Installation devDependency
- Vérifier la qualité / fraîcheur des types

## Exercices

1. Quelle commande installe les types Node ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```bash
   npm i -D @types/node
   ```
   :::

## Questions d'entretien

1. Qu’est-ce que DefinitelyTyped / `@types` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un dépôt et un espace de packages npm qui fournissent des fichiers de déclaration TypeScript pour des bibliothèques JavaScript qui n’incluent pas leurs propres types.
   :::
