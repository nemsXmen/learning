---
id: typescript-37-typed-mocks
title: Typed mocks
slug: typed-mocks
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-37-jest]
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Créer des mocks typés
- Respecter les interfaces
- Éviter any dans les doubles

## Introduction

Un **mock typé** implémente le même contrat que la dépendance réelle.

## Concept

```ts
import { vi } from "vitest";
import type { UserRepository } from "./user-repository";

const repo: UserRepository = {
  findById: vi.fn().mockResolvedValue(null),
  save: vi.fn()
};
```

```ts
const findById = vi.fn<[], Promise<User | null>>();
```

## Exemple

`Partial<UserRepository>` si on ne mocke qu’une partie (avec prudence).

## Comment ça fonctionne

En annotant le mock avec l’interface, TypeScript refuse les mauvaises signatures.

## Erreurs fréquentes

- mock as any
- Oublier de typer les retours Promise

## À retenir

- Mock : Interface
- vi.fn typé
- Pas d’any gratuit

## Exercices

1. Mock findById qui résout un User.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   findById: vi.fn().mockResolvedValue({ id: "1", email: "a@b.c" })
   ```
   :::

## Questions d'entretien

1. Comment types-tu un mock de repository ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En le déclarant comme l’interface `UserRepository` (ou un Partial contrôlé) et en typant les `vi.fn` / `jest.fn` pour respecter les signatures et types de retour.
   :::
