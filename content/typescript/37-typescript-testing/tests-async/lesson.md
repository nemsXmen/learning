---
id: typescript-37-tests-async
title: Tests async
slug: tests-async
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-37-typed-spies]
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Tester des fonctions async
- await dans les tests
- Gérer les rejets

## Introduction

Les tests TypeScript async s’appuient sur `async/await` et des expects sur Promises.

## Concept

```ts
it("loads user", async () => {
  const user = await getUser("1");
  expect(user.email).toBe("a@b.c");
});

it("rejects when missing", async () => {
  await expect(getUser("missing")).rejects.toThrow(/not found/i);
});
```

## Exemple

`waitFor` côté testing-library pour l’UI. Fakes timers pour le temps.

## Comment ça fonctionne

Le runner attend la Promise retournée par le test async. Types : Promise\<T\> inférée.

## Erreurs fréquentes

- Oublier await → test vert trop tôt
- Négliger les rejets

## À retenir

- async it
- expect(...).rejects
- await systématique

## Exercices

1. Teste qu’une Promise résout 42.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   await expect(Promise.resolve(42)).resolves.toBe(42);
   ```
   :::

## Questions d'entretien

1. Comment testes-tu qu’une async function échoue ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec `await expect(fn()).rejects.toThrow(...)` (ou try/catch + expect). Sans await, le test peut passer à tort.
   :::
