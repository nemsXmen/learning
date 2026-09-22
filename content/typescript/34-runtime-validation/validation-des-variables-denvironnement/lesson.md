---
id: typescript-34-validation-des-variables-denvironnement
title: Validation des variables d’environnement
slug: validation-des-variables-denvironnement
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 11
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-34-validation-des-api]
skills: [validation]
tags: [typescript, validation, env]
---

## Objectifs

- Valider process.env au démarrage
- Fail fast si config invalide
- Exposer un objet Config typé

## Introduction

Les **env vars** sont des strings externes : à parser et valider une fois.

## Concept

```ts
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url()
});

export const env = EnvSchema.parse(process.env);
```

## Exemple

Au boot : si parse échoue, le process refuse de démarrer.

## Comment ça fonctionne

`z.coerce` aide pour les numbers/booléens depuis des strings. Le reste de l’app importe `env` typé.

## Erreurs fréquentes

- process.env.X! partout
- Pas de validation → crash tardif

## À retenir

- Schema d’env
- parse au boot
- Config centralisée

## Exercices

1. Pourquoi valider l’env au démarrage ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour échouer immédiatement si la config est incomplète/invalide, plutôt qu’en plein trafic.
   :::

## Questions d'entretien

1. Comment sécurises-tu les variables d’environnement en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un schema (Zod…) parsé au démarrage, produisant un objet `env` typé. Plus de `process.env` dispersés non validés.
   :::
