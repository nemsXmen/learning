---
id: typescript-18-awaited
title: Awaited
slug: awaited
technology: typescript
level: intermediate
module: 18-utility-types
order: 14
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-18-instancetype]
skills: [utility-types]
tags: [typescript, utility-types, async]
---

## Objectifs

- Utiliser `Awaited<T>`
- Déballer les Promises (y compris imbriquées)
- Typer le résultat de `await`

## Introduction

`Awaited<T>` récursivement unwrap les Promises pour obtenir le type résolu.

## Concept

```ts
type A = Awaited<Promise<string>>; // string
type B = Awaited<Promise<Promise<number>>>; // number
type C = Awaited<string>; // string
```

## Exemple

```ts
async function loadUser() {
  return { id: 1, name: "Alice" };
}
type User = Awaited<ReturnType<typeof loadUser>>;
```

## Comment ça fonctionne

Type récursif qui détecte `PromiseLike` et unwrap jusqu’à un type non-thenable.

## Erreurs fréquentes

- Oublier Awaited sur un ReturnType de fonction async (on obtient Promise<...>)

## À retenir

- `Awaited<T>` = type après await
- Gère les Promises imbriquées
- Combo classique : `Awaited<ReturnType<typeof fn>>`

## Exercices

1. Extrais le type résolu de `Promise<Promise<"ok">>`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type T = Awaited<Promise<Promise<"ok">>>; // "ok"
   ```
   :::

## Questions d'entretien

1. Pourquoi utiliser Awaited sur le ReturnType d’une fonction async ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que ReturnType donne `Promise<...>`. Awaited unwrap la Promise pour obtenir le type de la valeur résolue, utile pour typer des variables ou des états.
   :::
