---
id: typescript-19-deepreadonly
title: DeepReadonly
slug: deepreadonly
technology: typescript
level: advanced
module: 19-mapped-types
order: 9
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-19-deeppartial]
skills: [mapped-types]
tags: [typescript, mapped-types]
---

## Objectifs

- Implémenter `DeepReadonly<T>`
- Figé profondément un type objet
- Le comparer à Readonly

## Introduction

`DeepReadonly` applique `readonly` à tous les niveaux.

## Concept

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

type State = {
  user: { name: string; roles: string[] };
  version: number;
};
type FrozenState = DeepReadonly<State>;
```

## Exemple

Utile pour les états globaux ou configs qui ne doivent pas être mutés.

## Comment ça fonctionne

Même pattern que DeepPartial, avec `readonly` au lieu de `?`.

## Erreurs fréquentes

- Tableaux : selon la version / le besoin, mapper aussi les éléments en readonly

## À retenir

- DeepReadonly = Readonly récursif
- États / configs immuables
- Affiner pour arrays si nécessaire

## Exercices

1. Écris DeepReadonly.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type DeepReadonly<T> = {
     readonly [K in keyof T]: T[K] extends object
       ? DeepReadonly<T[K]>
       : T[K];
   };
   ```
   :::

## Questions d'entretien

1. Readonly vs DeepReadonly ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Readonly ne fige que le premier niveau. DeepReadonly applique readonly récursivement aux objets imbriqués, pour une immutabilité type-level en profondeur.
   :::
