---
id: typescript-17-conditional-types
title: Conditional types
slug: conditional-types
technology: typescript
level: advanced
module: 17-advanced-types
order: 4
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-17-indexed-access-types]
skills: [advanced-types]
tags: [typescript, conditional-types]
---

## Objectifs

- Écrire des conditional types
- Comprendre `T extends U ? X : Y`
- Voir des cas d’usage courants

## Introduction

Un **conditional type** choisit un type selon une condition d’assignabilité.

## Concept

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<number>;  // false
```

```ts
type NonNullable<T> = T extends null | undefined ? never : T;
```

## Exemple

```ts
type ExtractArray<T> = T extends (infer U)[] ? U : never;
```

## Comment ça fonctionne

Si `T` est assignable à `U`, le type résultant est `X`, sinon `Y`. Avec des unions non distribuées, on peut envelopper dans un tuple `[T] extends [U]`.

## Erreurs fréquentes

- Oublier la distributivité sur les unions (voir leçon dédiée)
- Conditions trop complexes illisibles

## À retenir

- `T extends U ? X : Y`
- Base de nombreux utilitaires (Exclude, Extract, NonNullable…)
- Combinable avec `infer`

## Exercices

1. Écris un type `IsArray<T>` qui vaut true si T est un tableau.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type IsArray<T> = T extends any[] ? true : false;
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qu’un conditional type en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un type de la forme `T extends U ? X : Y` qui sélectionne X ou Y selon que T est assignable à U. C’est le fondement de beaucoup d’utilitaires et de transformations de types.
   :::
