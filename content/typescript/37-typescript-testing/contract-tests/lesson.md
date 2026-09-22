---
id: typescript-37-contract-tests
title: Contract tests
slug: contract-tests
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 14
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-37-e2e-tests]
skills: [testing]
tags: [typescript, testing, api]
---

## Objectifs

- Tester les contrats d’API
- Schema assertions
- CDC (Pact) en TS

## Introduction

Les **contract tests** vérifient que producteur et consommateur respectent le même contrat.

## Concept

```ts
it("response matches UserSchema", async () => {
  const res = await fetch("/users/1");
  const body: unknown = await res.json();
  expect(UserSchema.safeParse(body).success).toBe(true);
});
```

## Exemple

Pact (consumer-driven), OpenAPI validators, schema tests partagés.

## Comment ça fonctionne

Le consommateur définit les attentes ; le provider les vérifie. TypeScript type fixtures et schemas.

## Erreurs fréquentes

- Contrats non versionnés
- Fixtures obsolètes

## À retenir

- Schema parse en tests
- CDC si multi-équipes
- CI sur contrats

## Exercices

1. Que prouve UserSchema.safeParse(body).success ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Que le body respecte le schema User au moment du test.
   :::

## Questions d'entretien

1. Rôle des contract tests par rapport aux types partagés ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les types aident au dev local. Les contract tests vérifient runtime (et parfois inter-services) que le contrat est réellement respecté, y compris après déploiement.
   :::
