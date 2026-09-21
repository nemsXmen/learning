---
id: typescript-19-conditional-mapped-types
title: Conditional mapped types
slug: conditional-mapped-types
technology: typescript
level: advanced
module: 19-mapped-types
order: 6
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-19-key-remapping-avec-as]
skills: [mapped-types]
tags: [typescript, mapped-types, conditional-types]
---

## Objectifs

- Combiner mapped types et conditional types
- Transformer les valeurs selon leur type
- Filtrer par type de valeur

## Introduction

On peut appliquer une condition au type de chaque propriété pendant le mapping.

## Concept

```ts
type NonFunctionProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

type NullableProps<T> = {
  [K in keyof T]: T[K] | null;
};

type StringifyValues<T> = {
  [K in keyof T]: T[K] extends string ? T[K] : string;
};
```

## Exemple

```ts
type User = {
  id: number;
  name: string;
  save(): void;
};
type DataOnly = NonFunctionProps<User>;
// { id: number; name: string }
```

## Comment ça fonctionne

Le conditional s’évalue pour chaque clé. Combiné au key remapping, on filtre ; sans remapping, on transforme les valeurs.

## Erreurs fréquentes

- Conditions trop complexes illisibles

## À retenir

- Mapped + conditional = transformations conditionnelles
- Filtrage via `as ... never`
- Transformation des valeurs via `T[K] extends ...`

## Exercices

1. Crée un type qui met `| null` sur chaque propriété.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Nullable<T> = { [K in keyof T]: T[K] | null };
   ```
   :::

## Questions d'entretien

1. Comment filtres-tu les propriétés fonction dans un mapped type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En combinant un conditional sur `T[K] extends Function` avec un key remapping vers `never` pour les exclure : `[K in keyof T as T[K] extends Function ? never : K]`.
   :::
