---
id: typescript-29-configuration-typee
title: Configuration typée
slug: 29-configuration-typee
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-29-modules-nodejs]
skills: [nodejs]
tags: [typescript, nodejs, config]
---

## Objectifs

- Centraliser une config typée
- Combiner env + fichiers
- Exposer un objet Config sûr

## Introduction

Une app Node a besoin d’une **config** validée et typée au démarrage.

## Concept

```ts
type Config = {
  port: number;
  databaseUrl: string;
  logLevel: "debug" | "info" | "error";
};

function loadConfig(): Config {
  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: requireEnv("DATABASE_URL"),
    logLevel: (process.env.LOG_LEVEL as Config["logLevel"]) ?? "info"
  };
}
```

Mieux avec schema :

```ts
const config = ConfigSchema.parse({
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  logLevel: process.env.LOG_LEVEL
});
```

## Exemple

Charger aussi un `config.json` optionnel et merger.

## Comment ça fonctionne

Une seule fonction `loadConfig()` appelée au boot ; le reste de l’app reçoit `Config`.

## Erreurs fréquentes

- Lire process.env partout sans centraliser
- Cast sans validation

## À retenir

- Config unique typée
- Validation au boot
- Pas d’env éparpillé

## Exercices

1. Esquisse un type Config avec port et host.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Config = { port: number; host: string };
   ```
   :::

## Questions d'entretien

1. Comment structures-tu la configuration d’une app Node TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Une fonction de chargement unique qui lit env/fichiers, valide (schema), et retourne un objet `Config` typé consommé par injection ou import central — jamais des `process.env` dispersés non validés.
   :::
