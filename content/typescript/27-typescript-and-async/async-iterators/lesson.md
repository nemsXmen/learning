---
id: typescript-27-async-iterators
title: Async iterators
slug: async-iterators
technology: typescript
level: advanced
module: 27-typescript-and-async
order: 8
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-27-promise-any]
skills: [async]
tags: [typescript, async-iterator]
---

## Objectifs

- Comprendre AsyncIterable / AsyncIterator
- Utiliser for await...of
- Typer les flux async

## Introduction

Un **async iterator** produit des valeurs de façon asynchrone (streams, pages API…).

## Concept

```ts
async function consume(iterable: AsyncIterable<string>) {
  for await (const item of iterable) {
    console.log(item);
  }
}
```

```ts
interface AsyncIterator<T> {
  next(): Promise<IteratorResult<T>>;
}
```

## Exemple

Pagination :

```ts
async function* pages(url: string): AsyncGenerator<Page> {
  // yield chaque page
}
```

## Comment ça fonctionne

`for await...of` attend chaque `next()` qui retourne une Promise de résultat.

## Erreurs fréquentes

- for...of sur un async iterable (manque await)
- Oublier le typage de l’élément yieldé

## À retenir

- AsyncIterable<T>
- for await...of
- Streams / pagination

## Exercices

1. Écris une signature consume(lines: AsyncIterable<string>): Promise<void>.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   async function consume(lines: AsyncIterable<string>): Promise<void> {
     for await (const line of lines) {
       console.log(line);
     }
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre Iterable et AsyncIterable ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Iterable produit des valeurs de façon synchrone (for...of). AsyncIterable produit des valeurs via des Promises (for await...of), adapté aux sources asynchrones.
   :::
