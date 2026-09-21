---
id: typescript-11-exhaustiveness-avec-never
title: Exhaustiveness avec never
slug: exhaustiveness-avec-never
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 50
prerequisites: [typescript-11-fonctions-retournant-never, typescript-10-never-exhaustivite]
skills: [any-unknown-never]
tags: [typescript, never, exhaustiveness]
---

## Objectifs

- Revoir le pattern d’exhaustivité avec `never`
- L’appliquer systématiquement aux unions fermées
- Sécuriser l’évolution du code

## Introduction

`never` + default = filet de sécurité contre les cas oubliés.

## Concept

```ts
function assertNever(x: never): never {
  throw new Error("Unexpected: " + JSON.stringify(x));
}

type Event = { type: "click" } | { type: "scroll" };

function handle(e: Event) {
  switch (e.type) {
    case "click":
      return "clicked";
    case "scroll":
      return "scrolled";
    default:
      return assertNever(e);
  }
}
```

## Exemple

Si on ajoute `{ type: "keydown" }` sans case, compilation échoue.

## Comment ça fonctionne

Dans le default, si tout a été couvert, `e` est `never`. Sinon TypeScript errora.

## Erreurs fréquentes

- Omettre le default
- Typer le paramètre en `any` / `unknown` sans contrainte never

## À retenir

- Pattern standard de production
- À appliquer sur les switch d’unions discriminées
- Protège les refactors

## Exercices

1. Ajoute assertNever à un switch sur une literal union à 3 valeurs.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function f(x: "a" | "b" | "c") {
     switch (x) {
       case "a": return 1;
       case "b": return 2;
       case "c": return 3;
       default: return assertNever(x);
     }
   }
   ```
   :::

## Questions d'entretien


1. Comment never aide-t-il à maintenir l’exhaustivité quand une union évolue ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   En forçant le type restant dans le default à être never. Tout nouveau membre non géré rend ce type non-never et provoque une erreur de compilation, signalant qu’il faut mettre à jour le handler.
   :::

