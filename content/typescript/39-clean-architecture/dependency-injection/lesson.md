---
id: typescript-39-dependency-injection
title: Dependency injection
slug: architecture-dependency-injection
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 10
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-39-dependency-inversion]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Relier DI et Clean Architecture
- Composition root
- Wiring typé

## Introduction

L’**injection de dépendances** est le mécanisme qui câble ports et adapters.

## Concept

```ts
// main.ts — composition root
const users = new PrismaUserRepository(prisma);
const createUser = new CreateUser(users);
const controller = new UserController(createUser);
```

## Exemple

Nest, Inversify, ou wiring manuel dans `main`.

## Comment ça fonctionne

Au boot, on construit le graphe. Les use cases reçoivent des ports déjà résolus.

## Erreurs fréquentes

- new dans les use cases
- Service locator répandu

## À retenir

- Composition root
- Injecter les ports
- Un seul endroit de wiring

## Exercices

1. Où instancier PrismaUserRepository ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Dans la composition root (main / module framework), pas dans le domain.
   :::

## Questions d'entretien

1. Lien DI et Clean Architecture ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   La DI fournit les adapters concrets aux use cases via leurs ports, au moment du wiring (composition root), respectant l’inversion de dépendances.
   :::
