---
id: typescript-34-zod
title: Zod
slug: zod
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-34-schema-validation]
skills: [validation]
tags: [typescript, validation, zod]
---

## Objectifs

- Écrire des schemas Zod
- Utiliser parse et safeParse
- Composer objets, arrays, unions

## Introduction

**Zod** est une lib de validation TypeScript-first très répandue.

## Concept

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().positive().optional()
});

const user = UserSchema.parse(input); // throw ZodError si invalide
const result = UserSchema.safeParse(input);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## Exemple

```ts
z.array(UserSchema);
z.union([z.string(), z.number()]);
z.enum(["admin", "user"]);
```

## Comment ça fonctionne

Chaque schema est une valeur runtime qui valide et, via `z.infer`, expose un type.

## Erreurs fréquentes

- parse sans try/catch en bordure HTTP
- Schemas trop permissifs (passthrough non maîtrisé)

## À retenir

- z.object / z.string / …
- parse vs safeParse
- Erreurs structurées

## Exercices

1. Schema Product avec id string et price number positif.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const ProductSchema = z.object({
     id: z.string(),
     price: z.number().positive()
   });
   ```
   :::

## Questions d'entretien

1. parse vs safeParse en Zod ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `parse` throw un `ZodError` si invalide. `safeParse` retourne `{ success, data }` ou `{ success: false, error }` sans exception — utile pour contrôler le flux d’erreur.
   :::
