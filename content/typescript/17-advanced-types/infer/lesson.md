---
id: typescript-17-infer
title: infer
slug: infer
technology: typescript
level: advanced
module: 17-advanced-types
order: 5
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-17-conditional-types]
skills: [advanced-types]
tags: [typescript, infer]
---

## Objectifs

- Utiliser le mot-clé `infer`
- Extraire des types depuis d’autres types
- Reproduire des utilitaires comme ReturnType

## Introduction

`infer` permet de **capturer** une partie d’un type dans une variable de type locale au conditional type.

## Concept

```ts
type ReturnType<T> = T extends (...args: any) => infer R ? R : never;

type R = ReturnType<() => string>; // string
```

```ts
type ElementType<T> = T extends (infer U)[] ? U : never;
type E = ElementType<string[]>; // string
```

```ts
type FirstArg<T> = T extends (first: infer A, ...rest: any) => any ? A : never;
```

## Exemple

```ts
type Awaited<T> = T extends Promise<infer U> ? U : T;
```

## Comment ça fonctionne

Dans la branche `extends`, `infer X` déclare une variable de type qui capture le morceau correspondant du type testé. On ne peut utiliser `infer` que dans un conditional type.

## Erreurs fréquentes

- Utiliser `infer` hors d’un conditional type
- Plusieurs `infer` ambigus sans structure claire

## À retenir

- `infer R` capture un type
- Uniquement dans `T extends ... infer ... ? ...`
- Outil clé du type-level programming

## Exercices

1. Écris un type `PromiseValue<T>` qui extrait U de Promise<U>.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type PromiseValue<T> = T extends Promise<infer U> ? U : never;
   ```
   :::

## Questions d'entretien

1. À quoi sert le mot-clé `infer` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À déclarer une variable de type à l’intérieur d’un conditional type pour capturer une partie du type testé (retour de fonction, élément de tableau, paramètre de Promise, etc.).
   :::
