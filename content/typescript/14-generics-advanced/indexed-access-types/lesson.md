---
id: typescript-14-indexed-access-types
title: Indexed access types
slug: indexed-access-types
technology: typescript
level: intermediate
module: 14-generics-advanced
order: 3
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-14-keyof-avance]
skills: [generics]
tags: [typescript, indexed-access]
---

## Objectifs

- Utiliser les indexed access types `T[K]`
- Les combiner avec `keyof`
- Extraire des types de propriétés

## Introduction

`T[K]` permet d’obtenir le type de la propriété `K` de `T`.

## Concept

```ts
type User = {
  id: number;
  name: string;
  roles: string[];
};

type Id = User["id"];       // number
type Name = User["name"];   // string
type Roles = User["roles"]; // string[]

type IdOrName = User["id" | "name"]; // number | string
```

Avec génériques :

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## Exemple

```ts
type ElementType<T> = T extends (infer U)[] ? U : never;
// ou plus simple pour les tableaux :
type Elem<T extends any[]> = T[number];
```

## Comment ça fonctionne

`T[K]` est un type. Si `K` est une union, le résultat est l’union des types de propriétés correspondants.

## Erreurs fréquentes

- Utiliser une clé qui n’existe pas sur T
- Confondre la valeur runtime `obj[key]` et le type `T[K]`

## À retenir

- `T[K]` = type de la propriété K
- `T[K1 | K2]` = union des types
- Indispensable avec `keyof`

## Exercices

1. Extrais le type de la propriété `email` d’un type `User`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type User = { email: string; id: number };
   type Email = User["email"]; // string
   ```
   :::

## Questions d'entretien

1. Que signifie `T[K]` en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   C’est un indexed access type : le type de la propriété dont le nom est `K` dans le type `T`. Combiné à `keyof`, il permet un accès type-safe aux propriétés.
   :::
