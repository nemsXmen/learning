---
id: typescript-18-nonnullable
title: NonNullable
slug: nonnullable
technology: typescript
level: intermediate
module: 18-utility-types
order: 9
estimatedMinutes: 8
difficulty: 1
xp: 35
prerequisites: [typescript-18-extract]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `NonNullable<T>`
- Exclure null et undefined
- Le relier au narrowing

## Introduction

`NonNullable<T>` retire `null` et `undefined` de `T`.

## Concept

```ts
type T = string | null | undefined;
type U = NonNullable<T>; // string
```

## Exemple

```ts
function assertDefined<T>(value: T): NonNullable<T> {
  if (value == null) throw new Error("undefined");
  return value as NonNullable<T>;
}
```

## Comment ça fonctionne

Équivalent à `Exclude<T, null | undefined>` ou conditional type équivalent.

## Erreurs fréquentes

- Oublier qu’il ne retire que null/undefined, pas les autres falsy

## À retenir

- `NonNullable<T>` = sans null ni undefined
- Complète le narrowing
- Très courant avec strictNullChecks

## Exercices

1. Applique NonNullable à `number | null | undefined`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type N = NonNullable<number | null | undefined>; // number
   ```
   :::

## Questions d'entretien

1. Que retire `NonNullable<T>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `null` et `undefined` de l’union T. Les autres types (y compris 0 ou "") sont conservés.
   :::
