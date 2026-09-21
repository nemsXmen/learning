---
id: typescript-42-conditional-types
title: Conditional types
slug: type-level-conditional-types
technology: typescript
level: advanced
module: 42-type-level-programming
order: 3
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-transformations-de-types]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Maîtriser T extends U ? X : Y
- Distributivité sur les unions
- never et filtrage

## Introduction

Les **conditional types** branchent selon la forme de T.

## Concept

```ts
type IsArray<T> = T extends readonly unknown[] ? true : false;

// distributif
type ToArray<T> = T extends any ? T[] : never;
// string | number → string[] | number[]
```

## Exemple

```ts
type NonNullable<T> = T extends null | undefined ? never : T;
```

## Comment ça fonctionne

Avec un union nu, le conditionnel se distribue. `never` élimine des branches.

## Erreurs fréquentes

- Oublier la distributivité
- Wrapper dans [] pour empêcher la distribution sans le vouloir / le vouloir

## À retenir

- extends ? :
- Distribution
- Filtrage via never

## Exercices

1. NonNullable\<string | null\> ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   string
   :::

## Questions d'entretien

1. Qu’est-ce que la distributivité des conditional types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Quand T est une union, `T extends U ? X : Y` s’applique membre à membre, produisant une union de résultats — utile pour filtrer ou mapper chaque constituant.
   :::
