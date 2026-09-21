---
id: typescript-13-generic-callbacks
title: Generic callbacks
slug: generic-callbacks
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 13
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-13-keyof]
skills: [generics]
tags: [typescript, generics, callbacks]
---

## Objectifs

- Typer des callbacks génériques
- Propager les types à travers des higher-order typescript-basics
- Voir des patterns (map, filter, event handlers)

## Introduction

Les callbacks génériques permettent de garder le typage précis dans les higher-order typescript-basics.

## Concept

```ts
function map<T, U>(items: T[], callback: (item: T, index: number) => U): U[] {
  return items.map(callback);
}

const lengths = map(["a", "bb"], (s) => s.length); // number[]
```

```ts
function filter<T>(items: T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}
```

## Exemple

```ts
type Predicate<T> = (value: T) => boolean;
type Mapper<T, U> = (value: T) => U;

function process<T, U>(
  items: T[],
  predicate: Predicate<T>,
  mapper: Mapper<T, U>
): U[] {
  return items.filter(predicate).map(mapper);
}
```

## Comment ça fonctionne

Le paramètre de type de la fonction englobante se propage dans le type du callback. L’inférence contextuelle aide souvent à ne pas re-annoter les paramètres du callback.

## Erreurs fréquentes

- Typer le callback en `Function` ou `any`
- Oublier de propager `T` / `U` dans le callback

## À retenir

- Callbacks typés avec les mêmes paramètres de type
- Higher-order typescript-basics = terrain de jeu naturel des generics
- L’inférence contextuelle allège les annotations

## Exercices

1. Écris une fonction `forEach` générique avec un callback `(item: T) => void`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function forEach<T>(items: T[], callback: (item: T) => void): void {
     for (const item of items) callback(item);
   }
   ```
   :::

## Questions d'entretien

1. Comment types-tu un callback dans une fonction générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En réutilisant les paramètres de type de la fonction englobante dans la signature du callback, par exemple `(item: T) => U`. Cela propage le typage et permet une inférence contextuelle côté appelant.
   :::
