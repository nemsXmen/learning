---
id: typescript-35-contrats-e2e
title: Contrats E2E
slug: contrats-e2e
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 13
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-35-openapi]
skills: [api]
tags: [typescript, api]
---

## Objectifs

- Tester le respect du contrat
- Consumer-driven contracts
- Intégrer types + tests

## Introduction

Les **contrats E2E** se vérifient par des tests, pas seulement par des types.

## Concept

Approches :
- Tests d’intégration API contre schemas
- Pact / consumer-driven contracts
- Collection Postman/Newman + validations
- tRPC / GraphQL avec assertions de types runtime

```ts
test("GET /users/:id matches schema", async () => {
  const res = await fetch(`/users/${id}`);
  const body = await res.json();
  expect(() => UserSchema.parse(body)).not.toThrow();
});
```

## Exemple

CI : regenerer types + faire tourner contract tests à chaque changement de spec.

## Comment ça fonctionne

Les types empêchent les erreurs locales ; les tests de contrat capturent les divergences entre services déployés.

## Erreurs fréquentes

- Types verts, prod cassée (pas de contract tests)
- Fixtures obsolètes

## À retenir

- Schema assertions en tests
- CDC si multi-équipes
- CI sur le contrat

## Exercices

1. Que vérifie un test qui parse la réponse avec UserSchema ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Que le JSON réel respecte le contrat User à runtime.
   :::

## Questions d'entretien

1. Types partagés suffisent-ils pour des contrats E2E ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non. Ils aident au développement, mais des tests de contrat (schema parse, Pact, etc.) vérifient le comportement réel des services déployés et capturent les drifts.
   :::
