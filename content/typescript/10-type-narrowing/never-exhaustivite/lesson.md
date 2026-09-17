---
id: typescript-10-never-exhaustivite
title: never pour vérifier l’exhaustivité
slug: never-exhaustivite
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 13
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-10-exhaustive-checks, typescript-05-never]
skills: [type-narrowing]
tags: [typescript, never, exhaustiveness]
---

## Objectifs

- Utiliser `never` pour garantir l’exhaustivité
- Mettre en place le pattern `assertNever`
- Sécuriser les évolutions d’unions

## Introduction

`never` est l’outil final pour prouver qu’aucun cas n’a été oublié.

## Concept

```ts
function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}

type Shape = "circle" | "square";

function sides(shape: Shape): number {
  switch (shape) {
    case "circle": return 0;
    case "square": return 4;
    default:
      return assertNever(shape);
  }
}
```

Si on ajoute `"triangle"` à `Shape` sans case, `shape` dans le default n’est plus `never` → erreur de compilation.

## Exemple

```ts
function handle(result: { type: "a" } | { type: "b" }) {
  if (result.type === "a") {
    // ...
  } else if (result.type === "b") {
    // ...
  } else {
    assertNever(result);
  }
}
```

## Comment ça fonctionne

Quand tous les membres ont été éliminés par narrowing, le type restant est `never`. Passer cette valeur à une fonction qui exige `never` force TypeScript à vérifier l’exhaustivité.

## Erreurs fréquentes

- Oublier le default + assertNever
- Typer le paramètre d’assertNever en `any` (on perd la protection)

## À retenir

- `assertNever(x: never)` dans le default
- Protection contre les oublis lors de l’évolution des unions
- Pattern standard de production

## Exercices

1. Applique assertNever sur un switch de `"on" | "off"`.

   :::solution
   ```ts
   function f(state: "on" | "off") {
     switch (state) {
       case "on": return 1;
       case "off": return 0;
       default: return assertNever(state);
     }
   }
   ```
   :::

## Questions d'entretien

1. Comment utilises-tu `never` pour vérifier l’exhaustivité d’un switch ?

   :::reponse
   En plaçant dans le `default` un appel à une fonction `assertNever(x: never)`. Si un cas n’est pas géré, le type n’est pas `never` et TypeScript émet une erreur, signalant l’oubli.
   :::
