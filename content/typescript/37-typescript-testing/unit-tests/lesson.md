---
id: typescript-37-unit-tests
title: Unit tests
slug: unit-tests
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-37-type-testing]
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Écrire des unit tests typés
- Tester des fonctions pures
- S’appuyer sur l’inférence

## Introduction

Les **unit tests** vérifient des unités isolées (fonctions, classes).

## Concept

```ts
import { describe, it, expect } from "vitest";
import { add } from "./math";

describe("add", () => {
  it("sums two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

## Exemple

TypeScript infère les types des expects. Les mauvais arguments sont attrapés à la compile.

## Comment ça fonctionne

Même code TS que la prod. Le test runner exécute le JS compilé/transpilé.

## Erreurs fréquentes

- any dans les tests pour « aller plus vite »
- Tester l’implémentation privée plutôt que le comportement

## À retenir

- Tests en .ts / .tsx
- expect typé
- Comportement public

## Exercices

1. Écris un it qui attend add(1, 1) === 2.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   it("1+1", () => {
     expect(add(1, 1)).toBe(2);
   });
   ```
   :::

## Questions d'entretien

1. Avantage de TypeScript dans les unit tests ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les tests bénéficient du même système de types : appels incorrects, mocks mal typés et refactors sont détectés plus tôt, et l’autocomplete accélère l’écriture.
   :::
