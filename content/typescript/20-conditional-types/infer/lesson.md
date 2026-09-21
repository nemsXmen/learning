---
id: typescript-20-infer
title: infer
slug: 20-infer
technology: typescript
level: advanced
module: 20-conditional-types
order: 3
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-20-conditional-types-simples]
skills: [conditional-types]
tags: [typescript, infer]
---

## Objectifs

- Utiliser `infer` dans un conditional type
- Extraire des parties de types
- Reproduire ReturnType, ElementType, etc.

## Introduction

`infer` capture une portion de type dans une variable locale au conditional type.

## Concept

```ts
type ReturnType<T> = T extends (...args: any) => infer R ? R : never;
type ElementType<T> = T extends (infer U)[] ? U : never;
type PropType<T, K extends keyof T> = T[K]; // pas besoin d'infer ici
```

```ts
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
```

## Exemple

```ts
type FirstArg<T> = T extends (a: infer A, ...rest: any) => any ? A : never;
type A = FirstArg<(x: string, y: number) => void>; // string
```

## Comment ça fonctionne

Dans la branche `extends`, le motif avec `infer X` lie X au type correspondant. X n’est utilisable que dans ce conditional type.

## Erreurs fréquentes

- `infer` hors d’un conditional type
- Motifs trop ambigus

## À retenir

- `infer R` = capture
- Uniquement dans `extends ... ? ...`
- Extraction de retours, éléments, args, etc.

## Exercices

1. Extrais le type d’élément d’un tableau avec infer.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Elem<T> = T extends (infer U)[] ? U : never;
   ```
   :::

## Questions d'entretien

1. À quoi sert `infer` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À déclarer une variable de type dans un conditional type pour capturer une partie du type testé (retour de fonction, élément de tableau, type dans Promise, etc.).
   :::
