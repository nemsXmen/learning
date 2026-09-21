---
id: typescript-13-generic-typescript-basics
title: Generic typescript-basics
slug: generic-typescript-basics
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 2
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-13-pourquoi-les-generics]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Écrire des fonctions génériques
- Utiliser l’inférence et les arguments de type explicites
- Voir des exemples courants (identity, first, etc.)

## Introduction

Les fonctions génériques sont le point d’entrée le plus courant des generics.

## Concept

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([1, 2, 3]);        // number | undefined
const s = first(["a", "b"]);       // string | undefined
const explicit = first<string>([]); // string | undefined
```

Syntaxe : `function name<T>(...): ...`

## Exemple

```ts
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
```

## Comment ça fonctionne

À l’appel, TypeScript infère `T` à partir des arguments, ou on le fixe avec `fn<Type>(...)`.

## Erreurs fréquentes

- Forcer un type explicite inutilement
- Oublier que l’inférence part des arguments

## À retenir

- `function f<T>(...)`
- Inférence automatique dans la plupart des cas
- Argument de type explicite quand nécessaire

## Exercices

1. Écris une fonction générique `last` qui retourne le dernier élément d’un tableau.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function last<T>(items: T[]): T | undefined {
     return items[items.length - 1];
   }
   ```
   :::

## Questions d'entretien

1. Comment TypeScript choisit-il la valeur de `T` dans une fonction générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Principalement par inférence à partir des arguments passés à l’appel. On peut aussi la spécifier explicitement avec la syntaxe `fn<Type>(...)`.
   :::
