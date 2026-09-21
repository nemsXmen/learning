---
id: typescript-17-mapped-types
title: Mapped types
slug: mapped-types
technology: typescript
level: advanced
module: 17-advanced-types
order: 6
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-17-infer]
skills: [advanced-types]
tags: [typescript, mapped-types]
---

## Objectifs

- Écrire des mapped types
- Comprendre `{ [K in keyof T]: ... }`
- Voir Partial, Readonly, et variants custom

## Introduction

Un **mapped type** transforme les propriétés d’un type en itérant sur ses clés.

## Concept

```ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Partial<T> = {
  [K in keyof T]?: T[K];
};

type NullableProps<T> = {
  [K in keyof T]: T[K] | null;
};
```

## Exemple

```ts
type User = { id: number; name: string };
type ReadonlyUser = Readonly<User>;
// { readonly id: number; readonly name: string }
```

Modifiers : `readonly`, `?`, et leurs suppressions `-readonly`, `-?`.

## Comment ça fonctionne

`[K in keyof T]` itère sur chaque clé. On peut transformer la clé et/ou le type de la valeur.

## Erreurs fréquentes

- Oublier `keyof`
- Mapped types sur des unions non distribuées sans y penser

## À retenir

- `{ [K in keyof T]: ... }`
- Base de Partial, Required, Readonly, Pick…
- Modifiers `+`/`-` pour readonly et optional

## Exercices

1. Écris un mapped type `Stringify<T>` qui convertit toutes les propriétés en string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Stringify<T> = { [K in keyof T]: string };
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qu’un mapped type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un type qui itère sur les clés d’un autre type (`[K in keyof T]`) pour produire de nouvelles propriétés, éventuellement en modifiant optionalité, readonly ou le type des valeurs. C’est le mécanisme derrière Partial, Readonly, etc.
   :::
