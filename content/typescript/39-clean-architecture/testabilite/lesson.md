---
id: typescript-39-testabilite
title: Testabilité
slug: testabilite
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 13
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-frontieres-type-safe]
skills: [architecture]
tags: [typescript, architecture, testing]
---

## Objectifs

- Tester domain et use cases isolément
- Fakes de ports
- Tests d’adapters séparés

## Introduction

Clean Architecture **brille** pour les tests grâce aux ports.

## Concept

```ts
const users: UserRepository = {
  findByEmail: async () => null,
  save: async () => {}
};
const uc = new CreateUser(users);
await uc.execute({ email: "a@b.c", password: "x" });
```

## Exemple

- Domain : tests purs sans mocks
- Use cases : fakes in-memory
- Adapters : integration tests DB/HTTP

## Comment ça fonctionne

Pas besoin de lever toute la stack pour une règle métier.

## Erreurs fréquentes

- Tests uniquement E2E
- Mocks trop liés à Prisma

## À retenir

- Domain testable purement
- Fakes de ports
- Pyramide alignée architecture

## Exercices

1. Comment tester CreateUser sans base réelle ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Injecter un UserRepository in-memory / fake.
   :::

## Questions d'entretien

1. En quoi Clean Architecture améliore la testabilité TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les use cases et le domaine dépendent de ports : on injecte des fakes typés, on teste les règles sans IO, et on réserve les tests lourds aux adapters.
   :::
