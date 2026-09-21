---
id: typescript-08-types-union
title: Types union
slug: types-union
technology: typescript
level: beginner
module: 08-union-and-intersection
order: 1
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-06-union-avec-aliases]
skills: [unions-intersections]
tags: [typescript, unions]
---

## Objectifs

- Comprendre le type union (`|`)
- Savoir quand l’utiliser
- Voir le comportement de base

## Introduction

Une **union** représente une valeur qui peut être de l’un ou l’autre de plusieurs types.

## Concept

```ts
type Id = string | number;

function printId(id: Id) {
  console.log(id);
}

printId("abc");
printId(123);
```

Seules les opérations communes à tous les membres de l’union sont autorisées sans narrowing.

```ts
function example(value: string | number) {
  // value.toUpperCase(); // ❌ pas commun
  value.toString(); // OK – commun à string et number
}
```

## Exemple

```ts
type Status = "loading" | "success" | "error";
```

## Comment ça fonctionne

`A | B` signifie « A ou B ». TypeScript ne laisse accéder qu’aux membres partagés tant qu’on n’a pas réduit (narrow) le type.

## Erreurs fréquentes

- Accéder à une propriété spécifique sans narrowing
- Créer des unions trop larges

## À retenir

- `|` = ou
- Opérations communes uniquement sans narrowing
- Fondamental pour modéliser des alternatives

## Exercices

1. Crée un type `Result` qui peut être `string` ou `Error`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Result = string | Error;
   ```
   :::

## Questions d'entretien


1. Qu’est-ce qu’un type union en TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Un type qui représente une valeur pouvant être l’un ou l’autre de plusieurs types, écrit avec `|`. Seules les opérations communes sont autorisées tant qu’on n’a pas fait de narrowing.
   :::

