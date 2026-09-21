---
id: typescript-27-promise-all
title: Promise.all
slug: promise-all
technology: typescript
level: intermediate
module: 27-typescript-and-async
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-27-generic-async-typescript-basics]
skills: [async]
tags: [typescript, promise]
---

## Objectifs

- Typer `Promise.all`
- Comprendre le tuple de résultats
- Gérer l’échec d’une promesse

## Introduction

`Promise.all` attend que **toutes** les promesses réussissent.

## Concept

```ts
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id)
]);
// user: User, posts: Post[]  (tuple inféré)
```

## Exemple

```ts
const results: number[] = await Promise.all([1, 2, 3].map(async (n) => n * 2));
```

## Comment ça fonctionne

TypeScript infère un **tuple** quand l’argument est un tableau littéral de promesses de types distincts. Si une promesse rejette, tout rejette.

## Erreurs fréquentes

- Oublier qu’un seul rejet annule tout
- Typer trop large (Promise<any>[])

## À retenir

- Succès de toutes
- Tuple de résultats
- Fail-fast

## Exercices

1. Utilise Promise.all pour charger name: Promise<string> et age: Promise<number>.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const [name, age] = await Promise.all([getName(), getAge()]);
   ```
   :::

## Questions d'entretien

1. Que se passe-t-il si une promesse de Promise.all rejette ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Promise.all rejette immédiatement avec cette raison (fail-fast). Les autres promesses peuvent encore se terminer mais le résultat global est un rejet.
   :::
