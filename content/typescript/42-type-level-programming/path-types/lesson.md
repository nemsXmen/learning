---
id: typescript-42-path-types
title: Path types
slug: path-types
technology: typescript
level: advanced
module: 42-type-level-programming
order: 11
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-deep-transformations]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Chemins typés dans un objet
- PathValue / Path keys
- Cas formulaires / i18n

## Introduction

Les **path types** décrivent des chemins `a.b.c` valides dans une structure.

## Concept

```ts
type PathKeys<T> = {
  [K in keyof T & string]: T[K] extends object
    ? K | `${K}.${PathKeys<T[K]>}`
    : K;
}[keyof T & string];

type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : P extends keyof T
      ? T[P]
      : never;
```

## Exemple

`get(obj, "user.address.city")` typé.

## Comment ça fonctionne

Génération de l’union des chemins + résolution de la valeur au bout.

## Erreurs fréquentes

- Profondeur trop grande
- Arrays non gérés

## À retenir

- Union de paths
- PathValue
- DX formulaires

## Exercices

1. PathValue\<{ a: { b: number } }, "a.b"\> ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   number
   :::

## Questions d'entretien

1. À quoi servent les path types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À contraindre des strings de chemin vers des propriétés imbriquées existantes et à en déduire le type de valeur — utile pour formulaires, i18n, accessors génériques.
   :::
