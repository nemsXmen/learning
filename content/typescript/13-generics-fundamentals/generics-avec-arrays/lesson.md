---
id: typescript-13-generics-avec-arrays
title: Generics avec les arrays
slug: generics-avec-arrays
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-13-generic-parameters]
skills: [generics]
tags: [typescript, generics, arrays]
---

## Objectifs

- Typer des tableaux avec des generics
- Écrire des helpers génériques sur les arrays
- Voir le lien avec `Array<T>`

## Introduction

Les tableaux sont l’un des premiers endroits où les generics brillent.

## Concept

```ts
function head<T>(arr: T[]): T | undefined {
  return arr[0];
}

function toArray<T>(value: T): T[] {
  return [value];
}
```

`Array<T>` est équivalent à `T[]` :

```ts
function last<T>(arr: Array<T>): T | undefined {
  return arr[arr.length - 1];
}
```

## Exemple

```ts
function filterTruthy<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((x): x is T => x != null);
}
```

## Comment ça fonctionne

`T[]` propage le type des éléments. Les méthodes natives (`map`, `filter`…) sont déjà génériques.

## Erreurs fréquentes

- Annoter `any[]` par défaut
- Perdre le type en repassant par `any`

## À retenir

- `T[]` / `Array<T>`
- Helpers génériques très courants
- L’inférence fonctionne très bien avec les tableaux

## Exercices

1. Écris `unique` générique qui déduplique un tableau (via Set).

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function unique<T>(items: T[]): T[] {
     return [...new Set(items)];
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi les generics sont-ils naturels avec les tableaux ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce qu’un tableau est une structure homogène paramétrée par le type de ses éléments. `T[]` capture cette relation et se propage à travers les helpers (map, filter, head…).
   :::
