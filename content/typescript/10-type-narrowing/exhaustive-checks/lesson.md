---
id: typescript-10-exhaustive-checks
title: Exhaustive checks
slug: exhaustive-checks
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-10-discriminated-unions]
skills: [type-narrowing]
tags: [typescript, exhaustiveness]
---

## Objectifs

- Mettre en place des vérifications d’exhaustivité
- Protéger les switch et if contre les cas oubliés
- Préparer le terrain pour `never`

## Introduction

Un check exhaustif garantit que tous les membres d’une union sont traités.

## Concept

```ts
type Status = "a" | "b" | "c";

function handle(status: Status) {
  switch (status) {
    case "a": return 1;
    case "b": return 2;
    case "c": return 3;
    // pas de default → TypeScript peut déjà aider selon la config
  }
}
```

Pour forcer l’erreur à l’ajout d’un nouveau membre, on utilise `never` (leçon suivante).

## Exemple

Avec if :

```ts
function handle(result: { ok: true } | { ok: false }) {
  if (result.ok) {
    // ...
  } else {
    // ...
  }
  // exhaustif si l’union n’a que ces deux membres
}
```

## Comment ça fonctionne

Quand toutes les possibilités sont éliminées, le type restant est `never`. On s’en sert pour détecter les oublis.

## Erreurs fréquentes

- Default silencieux qui masque les cas manquants
- Unions qui évoluent sans mise à jour des handlers

## À retenir

- Viser l’exhaustivité sur les unions fermées
- Éviter les default qui avalent tout
- Combiner avec `never` pour une sécurité maximale

## Exercices

1. Écris un switch exhaustif sur `"red" | "green" | "blue"`.

   :::solution
   ```ts
   function colorCode(c: "red" | "green" | "blue"): string {
     switch (c) {
       case "red": return "#f00";
       case "green": return "#0f0";
       case "blue": return "#00f";
     }
   }
   ```
   :::

## Questions d'entretien

1. Comment évites-tu d’oublier un cas quand une union évolue ?

   :::reponse
   En visant des switch/if exhaustifs et en utilisant le pattern `assertNever` / `never` dans le default pour que l’ajout d’un membre provoque une erreur de compilation.
   :::
