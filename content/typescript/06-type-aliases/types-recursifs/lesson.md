---
id: typescript-06-types-recursifs
title: Types récursifs
slug: types-recursifs
technology: typescript
level: intermediate
module: 06-type-aliases
order: 8
estimatedMinutes: 20
difficulty: 3
xp: 60
prerequisites: [typescript-06-aliases-imbriques]
skills: [type-aliases]
tags: [typescript, type-aliases, recursive]
---

## Objectifs

- Comprendre les types récursifs
- Les déclarer avec des type aliases
- Voir des cas d’usage (arbres, JSON, listes chaînées)

## Introduction

Un type récursif se référence lui-même, directement ou indirectement. TypeScript les supporte via les type aliases (et les interfaces).

## Concept

```ts
type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };
```

```ts
type TreeNode = {
  value: number;
  children?: TreeNode[];
};
```

## Exemple

```ts
type LinkedList<T> = {
  value: T;
  next?: LinkedList<T>;
};

const list: LinkedList<string> = {
  value: "a",
  next: { value: "b", next: { value: "c" } }
};
```

## Comment ça fonctionne

TypeScript autorise la récursion dans les type aliases tant que le type est « productif » (il y a une base qui termine la récursion). Les interfaces supportent aussi la récursion.

## Erreurs fréquentes

- Créer des types récursifs infinis sans cas de base
- Complexité excessive qui ralentit le compilateur

## À retenir

- Les type aliases peuvent être récursifs
- Cas classiques : JSON, arbres, listes, structures imbriquées
- Toujours prévoir un cas de terminaison

## Exercices

1. Déclare un type `FileSystemEntry` qui peut être un fichier (name + size) ou un dossier (name + children récursifs).

   :::solution
   ```ts
   type FileSystemEntry =
     | { kind: "file"; name: string; size: number }
     | { kind: "dir"; name: string; children: FileSystemEntry[] };
   ```
   :::

## Questions d'entretien

1. Comment TypeScript gère-t-il les types récursifs ?

   :::reponse
   Via les type aliases (et les interfaces) qui peuvent se référencer eux-mêmes. Il faut un cas de base pour que le type soit productif. Exemples courants : structures JSON, arbres, listes chaînées.
   :::
