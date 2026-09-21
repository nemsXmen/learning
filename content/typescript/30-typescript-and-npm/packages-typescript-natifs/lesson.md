---
id: typescript-30-packages-typescript-natifs
title: Packages TypeScript natifs
slug: packages-typescript-natifs
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-30-at-types]
skills: [npm]
tags: [typescript, npm]
---

## Objectifs

- Identifier les packages écrits en TypeScript
- Voir le flux source → dist + .d.ts
- Avantages pour les consommateurs

## Introduction

Beaucoup de libs modernes sont **écrites en TypeScript** et publient JS + déclarations.

## Concept

```
src/index.ts  →  tsc  →  dist/index.js + dist/index.d.ts
```

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"]
}
```

## Exemple

Zod, Vite plugins TS, une grande partie de l’écosystème React typé.

## Comment ça fonctionne

Le mainteneur compile avec `declaration: true`. Les consommateurs n’ont pas besoin de `@types`.

## Erreurs fréquentes

- Publier les sources `.ts` sans build (selon le cas, acceptable avec certains loaders, rare pour libs classiques)
- Oublier d’inclure les `.d.ts` dans `files`

## À retenir

- Source TS → JS + d.ts
- Pas de @types nécessaire
- Meilleure synchro API/types

## Exercices

1. Quelle option tsc génère les .d.ts ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `"declaration": true`
   :::

## Questions d'entretien

1. Quel avantage d’un package TypeScript natif vs JS + @types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les types sont maintenus avec le code source : moins de désynchronisation, pas de package @types séparé, meilleure qualité en général.
   :::
