---
id: typescript-41-higher-order-type-utilities
title: Higher-order type utilities
slug: higher-order-type-utilities
technology: typescript
level: advanced
module: 41-advanced-generics
order: 14
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-41-recursive-generics]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Utilitaires qui transforment d’autres types
- Mapped + conditional combinés
- Composition de types

## Introduction

Les **higher-order type utilities** prennent des types et en produisent d’autres (comme des fonctions d’ordre supérieur).

## Concept

```ts
type Nullable<T> = { [K in keyof T]: T[K] | null };

type AwaitedProps<T> = {
  [K in keyof T]: Awaited<T[K]>;
};

type EventHandlers<T extends Record<string, any>> = {
  [K in keyof T as `on${Capitalize<string & K>}`]: (value: T[K]) => void;
};
```

## Exemple

Librairies de types (ts-toolbelt, type-fest) exposent de tels utilitaires.

## Comment ça fonctionne

Mapped types, conditionnels, template literals et infer se composent.

## Erreurs fréquentes

- Utilitaires opaques non documentés
- Complexité qui dépasse le bénéfice

## À retenir

- Types qui opèrent sur types
- Composition
- Lisibilité

## Exercices

1. Nullable\<{ a: string }\> devient ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `{ a: string | null }`
   :::

## Questions d'entretien

1. Qu’est-ce qu’un utilitaire de type d’ordre supérieur ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un type générique qui transforme d’autres types (mapped/conditional/template) pour dériver de nouvelles formes de façon réutilisable — analogue aux fonctions d’ordre supérieur, mais au niveau des types.
   :::
