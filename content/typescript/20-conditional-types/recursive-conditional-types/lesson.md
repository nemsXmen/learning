---
id: typescript-20-recursive-conditional-types
title: Recursive conditional types
slug: 20-recursive-conditional-types
technology: typescript
level: advanced
module: 20-conditional-types
order: 6
estimatedMinutes: 12
difficulty: 3
xp: 55
prerequisites: [typescript-20-conditional-types-imbriques]
skills: [conditional-types]
tags: [typescript, conditional-types]
---

## Objectifs

- Écrire des conditional types récursifs
- Traiter des structures imbriquées
- Connaître les limites

## Introduction

Un conditional type peut se rappeler lui-même pour descendre dans une structure.

## Concept

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
```

## Exemple

```ts
type Nested = number[][][];
type Flat = Flatten<Nested>; // number
```

## Comment ça fonctionne

La branche « objet / tableau » rappelle le type ; la branche feuille termine la récursion.

## Erreurs fréquentes

- Pas de cas de base → erreur de profondeur
- Structures cycliques mal gérées

## À retenir

- Récursion + cas de base
- Deep* helpers
- Limite de profondeur du compilateur

## Exercices

1. Écris Flatten pour aplatir les tableaux imbriqués jusqu’à la feuille.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
   ```
   :::

## Questions d'entretien

1. Quel est le risque principal des conditional types récursifs ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   L’absence de cas de base ou une profondeur trop grande, qui déclenche une erreur du compilateur (« type instantiation is excessively deep »).
   :::
