---
id: typescript-17-keyof
title: keyof
slug: 17-keyof
technology: typescript
level: advanced
module: 17-advanced-types
order: 1
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-13-keyof]
skills: [advanced-types]
tags: [typescript, keyof]
---

## Objectifs

- Maîtriser l’opérateur `keyof`
- L’utiliser dans des signatures avancées
- Comprendre `keyof` sur unions et intersections

## Introduction

`keyof T` produit l’union des noms de propriétés de `T`. C’est un pilier des types avancés.

## Concept

```ts
type User = { id: number; name: string };
type Keys = keyof User; // "id" | "name"

function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

Sur une union : clés communes. Sur une intersection : toutes les clés.

```ts
type A = { a: 1; c: 3 };
type B = { b: 2; c: 3 };
type KeyUnion = keyof (A | B); // "c"
type KeyInter = keyof (A & B); // "a" | "b" | "c"
```

## Exemple

```ts
type ReadonlyKeys = keyof { readonly x: number; y: string };
```

## Comment ça fonctionne

`keyof` est un type opérateur évalué à la compilation. Combiné à `extends` et aux indexed access, il permet des APIs type-safe.

## Erreurs fréquentes

- Appliquer `keyof` à `any` (résultat trop large)
- Oublier `extends keyof T` sur le paramètre de clé

## À retenir

- `keyof T` = union des clés
- Union → intersection des clés ; intersection → union des clés
- Base de Pick, Omit, et helpers custom

## Exercices

1. Écris le type des clés d’un `Product` avec `id` et `price`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Product = { id: string; price: number };
   type ProductKeys = keyof Product; // "id" | "price"
   ```
   :::

## Questions d'entretien

1. Que produit `keyof` sur une union de deux types objets ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   L’intersection des clés (uniquement les clés présentes dans tous les membres de l’union). Sur une intersection de types, `keyof` produit l’union de toutes les clés.
   :::
