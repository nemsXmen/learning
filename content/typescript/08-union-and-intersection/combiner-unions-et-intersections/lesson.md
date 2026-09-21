---
id: typescript-08-combiner-unions-et-intersections
title: Combiner unions et intersections
slug: combiner-unions-et-intersections
technology: typescript
level: intermediate
module: 08-union-and-intersection
order: 5
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-08-types-intersection]
skills: [unions-intersections]
tags: [typescript, unions, intersections]
---

## Objectifs

- Composer des types en mélangeant `|` et `&`
- Comprendre la précédence et les parenthèses
- Voir des patterns utiles

## Introduction

On combine souvent unions et intersections pour modéliser des formes précises.

## Concept

```ts
type A = { a: string };
type B = { b: number };
type C = { c: boolean };

type AB = A & B;
type ABC = (A | B) & C;
```

Les parenthèses contrôlent l’ordre :

```ts
type X = A & B | C;   // (A & B) | C
type Y = A & (B | C); // A & (B | C)
```

## Exemple

```ts
type WithId = { id: string };
type Success = WithId & { status: "success"; data: string };
type Failure = WithId & { status: "error"; message: string };
type Result = Success | Failure;
```

## Comment ça fonctionne

`&` a une précédence plus forte que `|` dans certains contextes, mais mieux vaut parenthéser explicitement pour la clarté.

## Erreurs fréquentes

- Oublier les parenthèses et obtenir un type inattendu
- Créer des compositions trop complexes

## À retenir

- On peut combiner librement `|` et `&`
- Parenthésage recommandé pour la lisibilité
- Pattern courant : base commune + variantes

## Exercices

1. Crée un type qui est soit `{ type: "a"; a: number }` soit `{ type: "b"; b: string }`, les deux ayant un `id: string` commun via intersection.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Base = { id: string };
   type A = Base & { type: "a"; a: number };
   type B = Base & { type: "b"; b: string };
   type Result = A | B;
   ```
   :::

## Questions d'entretien


1. Comment combine-t-on unions et intersections de façon lisible ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   En parenthésant explicitement et en nommant les briques intermédiaires avec des type aliases. On évite les expressions trop longues inline.
   :::

