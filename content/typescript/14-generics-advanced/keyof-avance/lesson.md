---
id: typescript-14-keyof-avance
title: keyof avancé
slug: keyof-avance
technology: typescript
level: intermediate
module: 14-generics-advanced
order: 2
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-13-keyof]
skills: [generics]
tags: [typescript, keyof]
---

## Objectifs

- Approfondir `keyof` avec des types complexes
- Combiner `keyof` et mapped types (aperçu)
- Filtrer des clés

## Introduction

`keyof` devient plus puissant combiné aux types conditionnels et aux unions.

## Concept

```ts
type User = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
};

type UserKeys = keyof User; // "id" | "name" | "email" | "createdAt"

// Clés de type string uniquement (aperçu)
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];
// StringKeys<User> ≈ "name" | "email"
```

## Exemple

```ts
function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}
```

## Comment ça fonctionne

`keyof` sur une union de types produit l’intersection des clés. Sur une intersection, il produit l’union des clés.

## Erreurs fréquentes

- Oublier le cast prudent avec `Object.keys` (retourne `string[]`)
- Appliquer `keyof` à `any` (donne `string | number | symbol`)

## À retenir

- `keyof` + génériques = accès type-safe aux propriétés
- Combinable avec mapped / conditional types
- Attention à `Object.keys`

## Exercices

1. Écris une fonction qui retourne les clés d’un objet typées comme `(keyof T)[]`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function typedKeys<T extends object>(obj: T): (keyof T)[] {
     return Object.keys(obj) as (keyof T)[];
   }
   ```
   :::

## Questions d'entretien

1. Que retourne `keyof` appliqué à une union de deux types objets ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   L’intersection des clés (les clés communes aux deux types). Pour une intersection de types, `keyof` produit l’union de toutes les clés.
   :::
