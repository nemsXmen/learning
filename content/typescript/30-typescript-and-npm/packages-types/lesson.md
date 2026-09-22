---
id: typescript-30-packages-types
title: Packages typés
slug: packages-types
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-30-packages-npm]
skills: [npm]
tags: [typescript, npm]
---

## Objectifs

- Reconnaître un package bien typé
- Lire les indices dans package.json
- Évaluer la qualité des types

## Introduction

Un **package typé** expose des déclarations utilisables immédiatement.

## Concept

Indices :
- champ `"types"` ou `"typings"`
- fichiers `.d.ts` publiés
- `"exports"` avec condition `"types"`
- écrit en TypeScript et compilé avec `declaration: true`

## Exemple

```json
{
  "name": "awesome-lib",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

## Comment ça fonctionne

Après `npm install`, TypeScript trouve les `.d.ts` et type-check les imports.

## Erreurs fréquentes

- Faire confiance à des types `@types` obsolètes
- Ignorer les erreurs de types tiers (parfois skipLibCheck)

## À retenir

- types + main/module
- Qualité variable
- Préférer libs TS natives à jour

## Exercices

1. Quel champ package.json pointe souvent vers le .d.ts principal ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `"types"` (ou `"typings"`).
   :::

## Questions d'entretien

1. Comment sais-tu qu’un package npm est typé ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Présence de `types`/`typings`, de conditions `types` dans `exports`, de fichiers `.d.ts` publiés, ou documentation indiquant le support TypeScript natif.
   :::
