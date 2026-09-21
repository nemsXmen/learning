---
id: typescript-27-async-generators
title: Async generators
slug: async-generators
technology: typescript
level: advanced
module: 27-typescript-and-async
order: 9
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-27-async-iterators]
skills: [async]
tags: [typescript, async-generator]
---

## Objectifs

- Écrire des `async function*`
- Typer AsyncGenerator
- Yield des valeurs async

## Introduction

Un **async generator** combine generators et async : on peut `await` et `yield`.

## Concept

```ts
async function* count(n: number): AsyncGenerator<number> {
  for (let i = 0; i < n; i++) {
    await delay(100);
    yield i;
  }
}

for await (const i of count(3)) {
  console.log(i);
}
```

## Exemple

```ts
async function* readLines(stream: ReadableStream): AsyncGenerator<string> {
  // yield chaque ligne
}
```

## Comment ça fonctionne

`async function*` retourne un `AsyncGenerator<T, TReturn, TNext>`. Chaque yield produit une valeur consommable en `for await`.

## Erreurs fréquentes

- Oublier async devant function*
- Confondre Generator et AsyncGenerator

## À retenir

- async function*
- AsyncGenerator<T>
- await + yield

## Exercices

1. Écris un async generator qui yield 0 puis 1.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   async function* two(): AsyncGenerator<number> {
     yield 0;
     yield 1;
   }
   ```
   :::

## Questions d'entretien

1. À quoi sert un async generator ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À produire un flux de valeurs asynchrones de façon paresseuse, en combinant await (pour les ops async) et yield (pour émettre chaque valeur), consommable via for await...of.
   :::
