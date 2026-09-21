---
id: typescript-37-integration-tests
title: Integration tests
slug: integration-tests
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-37-tsd]
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Tester plusieurs modules ensemble
- DB / API en intégration
- Typer fixtures et clients

## Introduction

Les **tests d’intégration** assemblent plusieurs pièces (repo + service + DB).

## Concept

```ts
it("creates and reads user", async () => {
  const created = await app.users.create({ email: "a@b.c", password: "secret" });
  const found = await app.users.get(created.id);
  expect(found.email).toBe("a@b.c");
});
```

## Exemple

DB de test, containers (Testcontainers), app Nest/Next en mode test.

## Comment ça fonctionne

Toujours du TS typé : fixtures, clients HTTP, assertions sur DTOs.

## Erreurs fréquentes

- Partager un état DB sale entre tests
- any sur les réponses HTTP

## À retenir

- Vraies frontières (DB, HTTP)
- Fixtures typées
- Isolation

## Exercices

1. Pourquoi une DB de test dédiée ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour isoler les tests, éviter de polluer la prod/dev, et contrôler le schema/données.
   :::

## Questions d'entretien

1. Unit vs integration en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Unit : isolation + mocks typés. Integration : vrais adaptateurs (DB, HTTP) avec types de fixtures et réponses, pour valider les câblages réels.
   :::
