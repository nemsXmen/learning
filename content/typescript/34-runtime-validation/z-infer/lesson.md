---
id: typescript-34-z-infer
title: z.infer
slug: z-infer
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-34-zod]
skills: [validation]
tags: [typescript, validation, zod]
---

## Objectifs

- Inférer le type depuis un schema Zod
- Éviter la duplication type/schema
- Utiliser z.input vs z.output si besoin

## Introduction

`z.infer<typeof Schema>` extrait le type TypeScript du schema.

## Concept

```ts
const UserSchema = z.object({
  id: z.string(),
  name: z.string()
});

type User = z.infer<typeof UserSchema>;
// { id: string; name: string }
```

## Exemple

```ts
function save(user: z.infer<typeof UserSchema>) {}
```

Avec transforms : `z.input` (avant) et `z.output` (après) peuvent différer.

## Comment ça fonctionne

Zod attache des types au schema ; `infer` les lit. Une seule source de vérité.

## Erreurs fréquentes

- Redéfinir type User à la main en parallèle
- Oublier typeof Schema

## À retenir

- type T = z.infer<typeof Schema>
- DRY
- input/output si transform

## Exercices

1. Infère le type de ProductSchema.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Product = z.infer<typeof ProductSchema>;
   ```
   :::

## Questions d'entretien

1. Pourquoi z.infer est-il important ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il évite de maintenir un type manuel séparé du schema : le type suit automatiquement les changements de validation, réduisant les dérives.
   :::
