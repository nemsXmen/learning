---
id: typescript-37-e2e-tests
title: E2E tests
slug: e2e-tests
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 13
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-37-integration-tests]
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Positionner les tests E2E
- Playwright / Cypress typés
- Limiter le scope

## Introduction

Les **E2E** exercent le système comme un utilisateur (UI + API).

## Concept

```ts
import { test, expect } from "@playwright/test";

test("login flow", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("a@b.c");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Dashboard")).toBeVisible();
});
```

## Exemple

Types Playwright/Cypress pour selectors et expects. Données de test typées.

## Comment ça fonctionne

Browser automation + assertions. Plus lents, plus fragiles : réserver aux parcours critiques.

## Erreurs fréquentes

- Trop d’E2E (lenteur, flakiness)
- Selectors non robustes

## À retenir

- Parcours critiques
- Outils typés
- Pyramide de tests

## Exercices

1. Outil E2E courant en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Playwright ou Cypress.
   :::

## Questions d'entretien

1. Où places-tu les E2E dans la stratégie de tests TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Au sommet de la pyramide : peu nombreux, sur les flows métier critiques, avec des outils typés (Playwright…). Le gros du filet reste unit + integration + type checks.
   :::
