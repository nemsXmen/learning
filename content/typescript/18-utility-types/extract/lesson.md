---
id: typescript-18-extract
title: Extract
slug: extract
technology: typescript
level: intermediate
module: 18-utility-types
order: 8
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-18-exclude]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `Extract<T, U>`
- Garder les membres d’union assignables à U
- Le voir comme l’inverse d’Exclude

## Introduction

`Extract<T, U>` conserve les membres de `T` assignables à `U`.

## Concept

```ts
type T = string | number | (() => void);
type Fns = Extract<T, Function>; // () => void

type Events = "click" | "scroll" | "mousemove";
type Mouse = Extract<Events, `mouse${string}`>; // "mousemove"
```

## Exemple

Utile pour filtrer des unions selon une forme.

## Comment ça fonctionne

`T extends U ? T : never` distribué.

## Erreurs fréquentes

- Inverser Extract et Exclude

## À retenir

- `Extract<T, U>` = intersection filtrée de l’union
- Inverse conceptuel d’Exclude
- Filtrage positif

## Exercices

1. Extrais les strings d’une union `string | number | boolean`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type OnlyString = Extract<string | number | boolean, string>;
   ```
   :::

## Questions d'entretien

1. Que fait `Extract<T, U>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il garde les membres de l’union T qui sont assignables à U. C’est l’opération inverse d’Exclude.
   :::
