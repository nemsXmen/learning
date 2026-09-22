---
id: typescript-44-schemas-vers-types
title: Schemas → types
slug: schemas-vers-types
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-44-code-generation]
skills: [tooling]
tags: [typescript, tooling, validation]
---

## Objectifs

- Dériver des types depuis Zod/JSON Schema
- Single source of truth
- z.infer et équivalents

## Introduction

**Schema → types** évite la duplication validation/typage.

## Concept

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email()
});

type User = z.infer<typeof UserSchema>;
```

## Exemple

JSON Schema → `json-schema-to-ts`, Valibot `v.InferOutput`.

## Comment ça fonctionne

Le schema runtime porte assez d’info pour inférer le type compile-time.

## Erreurs fréquentes

- Type manuel divergent du schema
- infer sur mauvaise variante input/output

## À retenir

- Schema source
- z.infer
- Pas de double définition

## Exercices

1. Type dérivé de UserSchema ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `type User = z.infer<typeof UserSchema>`
   :::

## Questions d'entretien

1. Pourquoi dériver les types d’un schema Zod ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour une seule source de vérité : la validation runtime et le type TypeScript restent synchronisés automatiquement.
   :::
