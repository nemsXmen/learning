---
id: typescript-17-indexed-access-types
title: Indexed access types
slug: 17-indexed-access-types
technology: typescript
level: advanced
module: 17-advanced-types
order: 3
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-14-indexed-access-types]
skills: [advanced-types]
tags: [typescript, indexed-access]
---

## Objectifs

- Approfondir `T[K]`
- Accéder à des types imbriqués
- Combiner avec des unions de clés

## Introduction

Les **indexed access types** extraient le type d’une propriété (ou d’un ensemble de propriétés).

## Concept

```ts
type User = {
  id: number;
  profile: { email: string; age: number };
};

type Email = User["profile"]["email"]; // string
type IdOrEmail = User["id" | "profile"]; // number | { email: string; age: number }
```

```ts
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
// ou : T[number] pour un tableau
```

## Exemple

```ts
type PropType<T, K extends keyof T> = T[K];
```

## Comment ça fonctionne

`T[K]` est un type. Si `K` est une union, le résultat est l’union des types indexés.

## Erreurs fréquentes

- Indexer avec une clé inexistante
- Oublier que `T[number]` extrait le type d’élément d’un tableau

## À retenir

- `T[K]` / `T["a"]` / `T[number]`
- Chaînable pour les imbrications
- Fondamental avec `keyof`

## Exercices

1. Extrais le type de `address.city` depuis un type `User`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type User = { address: { city: string } };
   type City = User["address"]["city"];
   ```
   :::

## Questions d'entretien

1. Que signifie `T[K]` quand K est une union de clés ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   C’est l’union des types de chacune des propriétés listées. Par exemple `User["id" | "name"]` vaut `User["id"] | User["name"]`.
   :::
