---
id: typescript-13-keyof
title: keyof
slug: keyof
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 12
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-13-extends]
skills: [generics]
tags: [typescript, generics, keyof]
---

## Objectifs

- Utiliser l’opérateur `keyof`
- Le combiner avec des generics
- Écrire des fonctions type-safe sur les clés d’objets

## Introduction

`keyof T` produit une union des noms de propriétés de `T`.

## Concept

```ts
type User = { id: number; name: string; email: string };
type UserKeys = keyof User; // "id" | "name" | "email"
```

Avec un generic :

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Alice" };
getProperty(user, "name"); // string
// getProperty(user, "age"); // ❌
```

## Exemple

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}
```

## Comment ça fonctionne

`keyof T` est un type opérateur. `K extends keyof T` restreint `K` aux clés valides de `T`. `T[K]` est le type de la propriété correspondante (indexed access type).

## Erreurs fréquentes

- Utiliser `string` au lieu de `keyof T`
- Oublier la contrainte `extends keyof T`

## À retenir

- `keyof T` = union des clés
- `K extends keyof T` + `T[K]` = accès type-safe
- Pattern fondamental (pluck, pick, etc.)

## Exercices

1. Écris une fonction `get` qui prend un objet et une clé valide et retourne la propriété.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function get<T, K extends keyof T>(obj: T, key: K): T[K] {
     return obj[key];
   }
   ```
   :::

## Questions d'entretien

1. À quoi sert `keyof` combiné à un generic ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À restreindre un paramètre de type aux clés d’un autre type (`K extends keyof T`) et à typer précisément la valeur retournée avec `T[K]`. C’est la base de nombreuses utilitaires type-safe (get, pluck, pick…).
   :::
