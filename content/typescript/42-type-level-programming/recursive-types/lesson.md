---
id: typescript-42-recursive-types
title: Recursive types
slug: recursive-types
technology: typescript
level: advanced
module: 42-type-level-programming
order: 6
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-template-literal-types]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Types récursifs avancés
- Bornes de profondeur
- Deep mapping

## Introduction

La **récursion** permet des transformations profondes.

## Concept

```ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type Depth = [never, 0, 1, 2, 3, 4, 5];
```

## Exemple

JSON type, paths imbriqués, tuples de longueur variable.

## Comment ça fonctionne

Conditional + mapped s’appellent récursivement. On peut borner avec un compteur de tuple.

## Erreurs fréquentes

- Instantiation excessively deep
- Oublier le cas de base

## À retenir

- Cas de base
- Profondeur bornée
- Deep* utilities

## Exercices

1. Pourquoi un cas de base dans DeepPartial ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour arrêter la récursion sur les primitives (non object).
   :::

## Questions d'entretien

1. Comment éviter « type instantiation is excessively deep » ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En bornant la profondeur (compteur), simplifiant les unions, évitant les récursions croisées, et en gardant des cas de base clairs.
   :::
