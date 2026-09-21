---
id: typescript-08-discriminated-unions
title: Discriminated unions
slug: discriminated-unions
technology: typescript
level: intermediate
module: 08-union-and-intersection
order: 6
estimatedMinutes: 20
difficulty: 3
xp: 60
prerequisites: [typescript-08-combiner-unions-et-intersections]
skills: [unions-intersections]
tags: [typescript, unions, discriminated]
---

## Objectifs

- Comprendre les discriminated unions (unions discriminées)
- Utiliser une propriété commune (discriminant) pour le narrowing
- Modéliser des états et des résultats

## Introduction

Une **discriminated union** est une union d’objets qui partagent une propriété littérale commune (le discriminant). Elle permet un narrowing extrêmement précis.

## Concept

```ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.size ** 2;
    case "rectangle":
      return shape.width * shape.height;
  }
}
```

Après `case "circle"`, TypeScript sait que `shape` a un `radius`.

## Exemple

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function handle(result: Result<number>) {
  if (result.ok) {
    console.log(result.value);
  } else {
    console.error(result.error);
  }
}
```

## Comment ça fonctionne

Le discriminant (souvent `kind`, `type`, `tag`, `ok`…) est une propriété de type littéral distincte pour chaque membre. TypeScript s’en sert pour réduire l’union.

## Erreurs fréquentes

- Oublier le discriminant
- Utiliser le même littéral pour deux membres
- Ne pas couvrir tous les cas (voir exhaustiveness)

## À retenir

- Discriminant = propriété littérale commune
- Narrowing automatique et puissant
- Pattern central pour les états, résultats, messages…

## Exercices

1. Modélise un type `NetworkState` avec "loading", "success" (data: string) et "error" (message: string).

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type NetworkState =
     | { status: "loading" }
     | { status: "success"; data: string }
     | { status: "error"; message: string };
   ```
   :::

## Questions d'entretien


1. Qu’est-ce qu’une discriminated union et pourquoi est-elle utile ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   C’est une union d’objets partageant une propriété littérale (discriminant). Elle permet à TypeScript de narrow automatiquement le type dans chaque branche d’un switch ou d’un if, rendant le code à la fois sûr et expressif.
   :::

