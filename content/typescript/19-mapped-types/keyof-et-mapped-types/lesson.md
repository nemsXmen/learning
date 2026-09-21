---
id: typescript-19-keyof-et-mapped-types
title: keyof + mapped types
slug: keyof-et-mapped-types
technology: typescript
level: advanced
module: 19-mapped-types
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-19-introduction-aux-mapped-types]
skills: [mapped-types]
tags: [typescript, mapped-types, keyof]
---

## Objectifs

- Combiner `keyof` et mapped types
- Itérer sur un sous-ensemble de clés
- Produire des types dérivés précis

## Introduction

`keyof` fournit l’ensemble des clés ; le mapped type les parcourt.

## Concept

```ts
type PickStringKeys<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type User = { id: number; name: string; email: string };
type StringFields = PickStringKeys<User>;
// { name: string; email: string }
```

## Exemple

```ts
type Flags<T> = {
  [K in keyof T]: boolean;
};
```

## Comment ça fonctionne

`keyof T` est une union. Le mapped type se distribue sur cette union pour générer une propriété par membre.

## Erreurs fréquentes

- Utiliser `string` au lieu de `keyof T` (perd la précision)

## À retenir

- `keyof` + `[K in ...]` = duo fondamental
- On peut filtrer les clés (via key remapping ou conditionals)
- Base de beaucoup d’utilities custom

## Exercices

1. Crée un type qui mappe toutes les clés de T vers `boolean`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type BooleanMap<T> = { [K in keyof T]: boolean };
   ```
   :::

## Questions d'entretien

1. Pourquoi couple-t-on souvent keyof et les mapped types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que keyof fournit l’union des clés à parcourir, et le mapped type construit une propriété pour chacune. Ensemble, ils permettent de transformer n’importe quel type objet de façon systématique et type-safe.
   :::
