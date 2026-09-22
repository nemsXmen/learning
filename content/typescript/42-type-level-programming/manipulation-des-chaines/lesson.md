---
id: typescript-42-manipulation-des-chaines
title: Manipulation des chaînes
slug: manipulation-des-chaines
technology: typescript
level: advanced
module: 42-type-level-programming
order: 9
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-manipulation-des-tuples]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Split / Join au type-level
- Remplacement de substrings
- Patterns pratiques

## Introduction

On peut **découper et recombiner** des string types.

## Concept

```ts
type Split<
  S extends string,
  D extends string
> = S extends `${infer Head}${D}${infer Rest}`
  ? [Head, ...Split<Rest, D>]
  : [S];

type Join<T extends string[], D extends string> =
  T extends [infer H extends string, ...infer R extends string[]]
    ? R extends []
      ? H
      : `${H}${D}${Join<R, D>}`
    : "";
```

## Exemple

Parser des routes `/users/:id` en segments typés.

## Comment ça fonctionne

Template + infer + récursion sur la string.

## Erreurs fréquentes

- Performance tsc sur de longues strings
- Cas vides non gérés

## À retenir

- Split/Join
- infer dans templates
- Bornes

## Exercices

1. Idée de Split<"a-b", "-"> ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ["a", "b"]
   :::

## Questions d'entretien

1. Comment « parser » une string type en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec des template literal types et `infer` pour extraire préfixe/suffixe, souvent en récursion pour split multiple, afin d’obtenir un tuple de segments.
   :::
