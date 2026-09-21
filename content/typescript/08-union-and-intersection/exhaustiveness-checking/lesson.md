---
id: typescript-08-exhaustiveness-checking
title: Exhaustiveness checking
slug: exhaustiveness-checking
technology: typescript
level: intermediate
module: 08-union-and-intersection
order: 7
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-08-discriminated-unions]
skills: [unions-intersections]
tags: [typescript, unions, exhaustiveness]
---

## Objectifs

- Vérifier que tous les cas d’une union sont traités
- Utiliser le pattern `assertNever` / `never`
- Sécuriser les switch et if

## Introduction

L’**exhaustiveness checking** garantit qu’on n’oublie aucun membre d’une union.

## Concept

```ts
type Shape = "circle" | "square" | "triangle";

function assertNever(x: never): never {
  throw new Error("Unexpected: " + x);
}

function sides(shape: Shape): number {
  switch (shape) {
    case "circle": return 0;
    case "square": return 4;
    case "triangle": return 3;
    default:
      return assertNever(shape); // erreur si un cas manque
  }
}
```

Si on ajoute `"hexagon"` à `Shape` sans gérer le case, TypeScript errora sur `assertNever`.

## Exemple

```ts
function handle(result: { ok: true } | { ok: false; error: string }) {
  if (result.ok) {
    // ...
  } else {
    // ...
  }
  // pas besoin de default si le narrowing est exhaustif
}
```

## Comment ça fonctionne

Dans le `default`, si tous les cas sont couverts, le type restant est `never`. Passer cette valeur à une fonction qui attend `never` force la vérification.

## Erreurs fréquentes

- Oublier le `default` + `assertNever`
- Utiliser un `default` qui avale silencieusement les cas manquants

## À retenir

- Pattern `assertNever` + `default`
- Protège contre les oublis lors de l’évolution des unions
- Indispensable avec les discriminated unions

## Exercices

1. Ajoute un `default: assertNever(...)` à un switch sur une literal union.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function f(x: "a" | "b"): number {
     switch (x) {
       case "a": return 1;
       case "b": return 2;
       default: return assertNever(x);
     }
   }
   ```
   :::

## Questions d'entretien


1. Comment garantis-tu qu’un switch sur une union est exhaustif en TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   En utilisant un `default` qui appelle une fonction `assertNever(x: never)`. Si un cas n’est pas géré, le type n’est pas `never` et TypeScript émet une erreur.
   :::

