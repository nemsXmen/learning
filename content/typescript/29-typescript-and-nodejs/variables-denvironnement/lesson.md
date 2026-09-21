---
id: typescript-29-variables-denvironnement
title: Variables d’environnement
slug: variables-denvironnement
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-29-process]
skills: [nodejs]
tags: [typescript, nodejs, env]
---

## Objectifs

- Lire et valider les variables d’environnement
- Typer une config env
- Éviter les string | undefined non gérés

## Introduction

Les env vars sont des **données externes** : à valider, pas à faire confiance aveuglément.

## Concept

```ts
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

const DATABASE_URL = requireEnv("DATABASE_URL");
```

Avec Zod :

```ts
const Env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().default(3000)
});
const env = Env.parse(process.env);
```

## Exemple

Augmenter ProcessEnv (avec prudence) :

```ts
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
  }
}
```

## Comment ça fonctionne

Validation au démarrage → config typée pour le reste de l’app.

## Erreurs fréquentes

- Non-null assertion sur process.env.X
- Pas de validation au boot

## À retenir

- env = externe
- requireEnv / schema
- Fail fast au démarrage

## Exercices

1. Écris requireEnv("API_KEY").

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function requireEnv(name: string): string {
     const v = process.env[name];
     if (!v) throw new Error(`Missing ${name}`);
     return v;
   }
   const API_KEY = requireEnv("API_KEY");
   ```
   :::

## Questions d'entretien

1. Comment types-tu les variables d’environnement en Node + TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En les validant au démarrage (helper requireEnv ou schema Zod) pour obtenir des strings/numbers garantis, plutôt qu’en multipliant les `process.env.X!`.
   :::
