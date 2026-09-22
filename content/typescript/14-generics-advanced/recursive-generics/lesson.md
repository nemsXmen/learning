---
id: typescript-14-recursive-generics
title: Recursive generics
slug: recursive-generics
technology: typescript
level: advanced
module: 14-generics-advanced
order: 10
estimatedMinutes: 15
difficulty: 3
xp: 60
prerequisites: [typescript-14-abstractions-reutilisables]
skills: [generics]
tags: [typescript, generics, recursive]
---

## Objectifs

- Comprendre les types génériques récursifs
- Voir des cas d’usage (arbres, listes, JSON)
- Connaître les limites du compilateur

## Introduction

Un type générique peut se référencer lui-même.

## Concept

```ts
type TreeNode<T> = {
  value: T;
  children?: TreeNode<T>[];
};

type LinkedList<T> = {
  value: T;
  next?: LinkedList<T>;
};
```

```ts
type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };
```

## Exemple

```ts
function walk<T>(node: TreeNode<T>, visit: (v: T) => void) {
  visit(node.value);
  node.children?.forEach(child => walk(child, visit));
}
```

## Comment ça fonctionne

TypeScript autorise la récursion dans les types tant qu’elle est « productive » (cas de base présent). Des récursions trop profondes peuvent provoquer des erreurs de compilation (« type instantiation is excessively deep »).

## Erreurs fréquentes

- Récursion infinie sans cas de base
- Complexité excessive

## À retenir

- Generics récursifs = arbres, listes, structures imbriquées
- Toujours un cas de terminaison
- Attention à la profondeur

## Exercices

1. Déclare un type `FileSystemNode<T>` avec value et children optionnels récursifs.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type FileSystemNode<T> = {
     value: T;
     children?: FileSystemNode<T>[];
   };
   ```
   :::

## Questions d'entretien

1. Que sont les recursive generics et à quoi servent-ils ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Ce sont des types génériques qui se référencent eux-mêmes. Ils servent à modéliser des structures récursives (arbres, listes chaînées, JSON…). Il faut un cas de base pour que le type reste productif.
   :::
