---
id: typescript-20-distributive-conditional-types
title: Distributive conditional types
slug: 20-distributive-conditional-types
technology: typescript
level: advanced
module: 20-conditional-types
order: 4
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-20-infer]
skills: [conditional-types]
tags: [typescript, conditional-types]
---

## Objectifs

- Comprendre la distributivité sur les unions
- Activer / désactiver la distribution
- L’utiliser dans Exclude / Extract

## Introduction

Quand le type testé est un **paramètre de type nu**, le conditional se distribue sur chaque membre de l’union.

## Concept

```ts
type ToArray<T> = T extends any ? T[] : never;
type A = ToArray<string | number>; // string[] | number[]

type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type B = ToArrayNonDist<string | number>; // (string | number)[]
```

## Exemple

```ts
type Exclude<T, U> = T extends U ? never : T;
type T = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
```

## Comment ça fonctionne

Naked type parameter → distribution. Envelopper dans un tuple `[T]` désactive la distribution.

## Erreurs fréquentes

- Résultat inattendu faute d’avoir anticipé la distributivité

## À retenir

- Naked T → distributif
- `[T]` → non distributif
- Base d’Exclude / Extract

## Exercices

1. Montre ToArray distributif vs non distributif sur `string | number`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type D<T> = T extends any ? T[] : never; // string[] | number[]
   type N<T> = [T] extends [any] ? T[] : never; // (string | number)[]
   ```
   :::

## Questions d'entretien

1. Comment désactive-t-on la distributivité d’un conditional type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En enveloppant le type testé dans un tuple : `[T] extends [U] ? X : Y` au lieu de `T extends U ? X : Y`.
   :::
