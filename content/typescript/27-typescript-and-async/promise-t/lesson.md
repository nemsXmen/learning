---
id: typescript-27-promise-t
title: Promise<T>
slug: promise-t
technology: typescript
level: intermediate
module: 27-typescript-and-async
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [async]
tags: [typescript, promise, async]
---

## Objectifs

- Typer une `Promise<T>`
- Comprendre T comme type de résolution
- Distinguer Promise et valeur

## Introduction

`Promise<T>` représente une valeur asynchrone qui résoudra en `T` (ou rejettera).

## Concept

```ts
const p: Promise<number> = Promise.resolve(42);
const userPromise: Promise<User> = fetchUser("1");
```

```ts
async function load(): Promise<string> {
  return "ok";
}
```

## Exemple

```ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

## Comment ça fonctionne

Le paramètre `T` est le type de la valeur de **succès**. Les rejets sont typés de façon lâche (`any` / `unknown` selon le contexte) sauf patterns avancés.

## Erreurs fréquentes

- Confondre `Promise<T>` et `T`
- Oublier le type de retour async → Promise implicite

## À retenir

- `Promise<T>` = futur T
- async function → Promise
- await unwrap T

## Exercices

1. Type une fonction qui retourne Promise<string[]>.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function getNames(): Promise<string[]> {
     return Promise.resolve(["a", "b"]);
   }
   ```
   :::

## Questions d'entretien

1. Que représente le paramètre T dans Promise<T> ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le type de la valeur lorsque la promesse est résolue avec succès. Ce n’est pas le type de l’erreur de rejet.
   :::
