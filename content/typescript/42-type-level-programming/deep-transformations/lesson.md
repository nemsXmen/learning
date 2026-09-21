---
id: typescript-42-deep-transformations
title: Deep transformations
slug: deep-transformations
technology: typescript
level: advanced
module: 42-type-level-programming
order: 10
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-manipulation-des-chaines]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- DeepPartial / DeepReadonly / DeepRequired
- Traiter arrays et objets
- Cas limites

## Introduction

Les transformations **deep** appliquent une règle à toute la profondeur.

## Concept

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[K] extends object
      ? DeepReadonly<T[K]>
      : T[K];
};
```

## Exemple

DeepNullable, DeepNonNullable selon les besoins API.

## Comment ça fonctionne

Branches pour arrays, objects, primitives. Attention aux fonctions et built-ins (Date…).

## Erreurs fréquentes

- Traiter Date comme object libre
- Boucles sur unions complexes

## À retenir

- Cas array / object / primitive
- Exceptions built-in
- Utilitaires documentés

## Exercices

1. Faut-il mapper récursivement une Date ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   En général non — la traiter comme primitive opaque.
   :::

## Questions d'entretien

1. Point d’attention des Deep* types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Bien séparer primitives, arrays, objets et built-ins (Date, Map, fonctions) pour éviter des transformations absurdes ou des récursions explosives.
   :::
