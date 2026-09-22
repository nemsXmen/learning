---
id: typescript-37-vitest
title: Vitest
slug: vitest
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-37-unit-tests]
skills: [testing]
tags: [typescript, testing, vitest]
---

## Objectifs

- Utiliser Vitest avec TypeScript
- Config de base
- API expect / vi

## Introduction

**Vitest** est un test runner moderne, excellent avec Vite et TypeScript.

## Concept

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node"
  }
});
```

```ts
import { describe, it, expect, vi } from "vitest";
```

## Exemple

Support natif ESM, TS, watch rapide. Compatible API type Jest.

## Comment ça fonctionne

Transpilation via Vite/esbuild. Types fournis par le package vitest.

## Erreurs fréquentes

- Mauvais environment (node vs jsdom)
- Paths non résolus (aligner avec tsconfig)

## À retenir

- vitest.config.ts
- import depuis vitest
- Rapide + TS-friendly

## Exercices

1. D’où importe-t-on describe/it/expect avec Vitest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Depuis `"vitest"`.
   :::

## Questions d'entretien

1. Pourquoi Vitest est-il populaire avec TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Intégration native TS/ESM, vitesse (esbuild), API familière (Jest-like), et bonne DX avec Vite — idéal pour projets TS modernes.
   :::
