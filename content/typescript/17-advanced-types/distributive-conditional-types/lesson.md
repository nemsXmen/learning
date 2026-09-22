---
id: typescript-17-distributive-conditional-types
title: Distributive conditional types
slug: distributive-conditional-types
technology: typescript
level: advanced
module: 17-advanced-types
order: 9
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-17-recursive-conditional-types]
skills: [advanced-types]
tags: [typescript, conditional-types]
---

## Objectifs

- Comprendre la distributivité des conditional types sur les unions
- Savoir l’activer et la désactiver
- L’utiliser à bon escient

## Introduction

Par défaut, un conditional type sur une **union** se distribue sur chaque membre.

## Concept

```ts
type ToArray<T> = T extends any ? T[] : never;

type R = ToArray<string | number>;
// string[] | number[]  (distribué)
// PAS (string | number)[]
```

Pour **désactiver** la distributivité, envelopper dans un tuple :

```ts
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type R2 = ToArrayNonDist<string | number>;
// (string | number)[]
```

## Exemple

`Exclude` et `Extract` s’appuient sur la distributivité.

```ts
type Exclude<T, U> = T extends U ? never : T;
type T = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
```

## Comment ça fonctionne

Quand le type testé (à gauche de `extends`) est un paramètre de type nu (naked type parameter), TypeScript distribue sur les unions.

## Erreurs fréquentes

- Résultat inattendu car on a oublié la distributivité
- Ou l’inverse : on voulait distribuer et on a enveloppé dans un tuple

## À retenir

- Naked `T extends ...` → distributif sur les unions
- `[T] extends [...]` → non distributif
- Base de Exclude / Extract

## Exercices

1. Montre la différence entre un ToArray distributif et non distributif sur `string | number`.

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

1. Qu’est-ce que la distributivité des conditional types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Lorsqu’un conditional type est appliqué à une union via un paramètre de type « nu », TypeScript applique la condition à chaque membre séparément et unionne les résultats. On peut la désactiver en enveloppant le type dans un tuple `[T]`.
   :::
