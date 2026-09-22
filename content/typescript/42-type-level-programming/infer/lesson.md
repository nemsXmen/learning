---
id: typescript-42-infer
title: infer
slug: type-level-infer
technology: typescript
level: advanced
module: 42-type-level-programming
order: 7
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-recursive-types]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Utiliser infer dans les conditionnels
- Extraire des parties de types
- Patterns courants

## Introduction

**infer** déclare une variable de type locale dans un extends.

## Concept

```ts
type ElementOf<T> = T extends (infer U)[] ? U : never;

type ReturnOf<T> = T extends (...args: any) => infer R ? R : never;

type PropType<T, K extends keyof T> = T[K]; // parfois sans infer
```

## Exemple

```ts
type FirstArg<T> = T extends (first: infer A, ...rest: any) => any ? A : never;
```

## Comment ça fonctionne

Si le pattern match, `infer X` capture le type correspondant.

## Erreurs fréquentes

- infer hors d’un conditional extends
- Patterns trop larges (any)

## À retenir

- infer dans extends
- Extraction
- ReturnType / ElementOf

## Exercices

1. ElementOf\<string[]\> ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   string
   :::

## Questions d'entretien

1. À quoi sert le mot-clé infer ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À introduire une variable de type dans une branche `extends` d’un conditional type, pour capturer et réutiliser une partie du type matché (retour de fonction, élément de tableau, etc.).
   :::
