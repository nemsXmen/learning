---
id: typescript-08-unions-litterales
title: Unions littérales
slug: unions-litterales
technology: typescript
level: beginner
module: 08-union-and-intersection
order: 3
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-08-string-or-number]
skills: [unions-intersections]
tags: [typescript, unions, literals]
---

## Objectifs

- Créer des unions de littéraux
- Comprendre leur puissance pour le narrowing
- Les utiliser pour les statuts, rôles, modes…

## Introduction

Les **literal unions** restreignent une valeur à un ensemble fini de littéraux.

## Concept

```ts
type Direction = "north" | "south" | "east" | "west";
type Status = "idle" | "loading" | "success" | "error";
type Dice = 1 | 2 | 3 | 4 | 5 | 6;
```

TypeScript refuse toute valeur hors de l’ensemble :

```ts
let dir: Direction = "north";
// dir = "up"; // ❌
```

## Exemple

```ts
function move(direction: Direction) {
  switch (direction) {
    case "north": /* ... */ break;
    case "south": /* ... */ break;
    case "east": /* ... */ break;
    case "west": /* ... */ break;
  }
}
```

## Comment ça fonctionne

Chaque littéral est un type à part entière. Leur union forme un ensemble fermé, idéal pour les machines à états et les enums « légères ».

## Erreurs fréquentes

- Utiliser `string` trop large alors qu’une literal union suffirait
- Oublier un cas dans un switch (voir exhaustiveness)

## À retenir

- `"a" | "b" | "c"` = ensemble fermé de valeurs
- Excellent pour le narrowing et l’autocomplétion
- Alternative souvent préférable aux enums numériques

## Exercices

1. Crée un type `HttpMethod` pour "GET" | "POST" | "PUT" | "DELETE".

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
   ```
   :::

## Questions d'entretien


1. Quel est l’intérêt des literal unions par rapport à un simple `string` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Elles restreignent les valeurs possibles à un ensemble connu, améliorent l’autocomplétion, permettent un narrowing précis et détectent les fautes de frappe à la compilation.
   :::

