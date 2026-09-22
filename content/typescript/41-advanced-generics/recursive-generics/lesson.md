---
id: typescript-41-recursive-generics
title: Recursive generics
slug: advanced-recursive-generics
technology: typescript
level: advanced
module: 41-advanced-generics
order: 13
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-41-repositories-avances]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Types récursifs
- Profondeur et limites
- Cas JSON / trees

## Introduction

Les **types récursifs** se référencent eux-mêmes pour décrire des structures imbriquées.

## Concept

```ts
type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

type TreeNode<T> = {
  value: T;
  children: TreeNode<T>[];
};
```

## Exemple

DeepReadonly, DeepPartial (utilitaires récursifs).

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};
```

## Comment ça fonctionne

Le compilateur déroule la récursion jusqu’à une limite. Attention aux unions qui explosent.

## Erreurs fréquentes

- Récursion infinie non bornée
- Mapped récursif sur never/any mal géré

## À retenir

- Auto-référence
- Bornes de profondeur
- Cas tree/JSON

## Exercices

1. Type List\<T\> = { head: T; tail: List\<T\> | null }.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type List<T> = { head: T; tail: List<T> | null };
   ```
   :::

## Questions d'entretien

1. À quoi servent les types récursifs ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À modéliser des structures imbriquées arbitrairement (JSON, arbres, deep partial/readonly) tout en gardant un typage précis à chaque niveau.
   :::
