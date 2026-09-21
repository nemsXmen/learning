---
id: typescript-37-jest
title: Jest
slug: jest
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-37-vitest]
skills: [testing]
tags: [typescript, testing, jest]
---

## Objectifs

- Utiliser Jest avec TypeScript
- ts-jest / babel-jest
- Différences avec Vitest

## Introduction

**Jest** reste très répandu ; il s’intègre à TypeScript via ts-jest ou SWC.

## Concept

```ts
// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node"
};
export default config;
```

```ts
test("adds", () => {
  expect(1 + 1).toBe(2);
});
```

## Exemple

`@types/jest` pour les globals si besoin.

## Comment ça fonctionne

Transpilation des fichiers TS avant exécution. API `jest.fn`, `jest.mock`.

## Erreurs fréquentes

- Config paths/moduleNameMapper manquante
- Mélanger globals et imports

## À retenir

- preset ts-jest
- Config typée
- Écosystème mature

## Exercices

1. Quel preset courant pour Jest + TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `ts-jest` (ou SWC).
   :::

## Questions d'entretien

1. Jest vs Vitest pour un projet TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Jest : écosystème mature, large adoption. Vitest : plus rapide, ESM/TS natif, DX Vite. Le choix dépend de l’existant et de la stack (Vite vs legacy).
   :::
