---
id: typescript-30-champ-types
title: Champ types
slug: champ-types
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-30-packages-javascript]
skills: [npm]
tags: [typescript, npm]
---

## Objectifs

- Configurer le champ `types` / `typings`
- Pointer vers le bon .d.ts
- Le coordonner avec main/module

## Introduction

Le champ **`types`** (alias historique `typings`) indique l’entrée des déclarations.

## Concept

```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts"
}
```

## Exemple

Si omis, TypeScript cherche `index.d.ts` à côté de l’entrée JS, mais explicite est mieux.

## Comment ça fonctionne

Les outils de résolution de types lisent ce champ pour trouver le graphe de déclarations.

## Erreurs fréquentes

- Chemin types incorrect après build
- types pointant vers du .ts source non publié

## À retenir

- types → .d.ts d’entrée
- Cohérent avec main
- Explicite > implicite

## Exercices

1. Ajoute un champ types vers dist/index.d.ts.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "types": "./dist/index.d.ts" }
   ```
   :::

## Questions d'entretien

1. À quoi sert le champ `types` dans package.json ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À indiquer le fichier de déclaration TypeScript principal du package, pour que les consommateurs résolvent correctement les types à l’import.
   :::
