---
id: typescript-09-configuration-typee
title: Configuration typée
slug: configuration-typee
technology: typescript
level: intermediate
module: 09-literal-types
order: 9
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-09-literal-inference]
skills: [literal-types]
tags: [typescript, config, literals]
---

## Objectifs

- Typer des objets de configuration avec des littéraux
- Utiliser `as const` + `typeof` pour dériver les types
- Éviter les configs « stringly typed »

## Introduction

Les configurations sont un excellent terrain pour les literal types.

## Concept

```ts
const config = {
  env: "production",
  logLevel: "info",
  port: 3000
} as const;

type Config = typeof config;
// {
//   readonly env: "production";
//   readonly logLevel: "info";
//   readonly port: 3000;
// }
```

Ou avec des unions plus souples :

```ts
type Env = "development" | "staging" | "production";
type LogLevel = "debug" | "info" | "warn" | "error";

interface AppConfig {
  env: Env;
  logLevel: LogLevel;
  port: number;
}
```

## Exemple

```ts
function start(config: AppConfig) {
  if (config.env === "production") {
    // ...
  }
}
```

## Comment ça fonctionne

On combine literal unions pour les champs fermés et `as const` pour figer les valeurs par défaut. Le type documente exactement ce qui est autorisé.

## Erreurs fréquentes

- Tout laisser en `string` / `number`
- Configs non validées à runtime (compléter avec Zod etc. en production)

## À retenir

- Literal unions pour les champs à valeurs fermées
- `as const` pour les constantes de config
- Le type devient une doc vivante

## Exercices

1. Type une config avec `theme: "light" | "dark"` et `locale: "fr" | "en"`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type AppConfig = {
     theme: "light" | "dark";
     locale: "fr" | "en";
   };
   ```
   :::

## Questions d'entretien


1. Comment types-tu une configuration d’application en TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   En utilisant des literal unions pour les champs à ensemble fermé (env, logLevel, theme…), éventuellement `as const` pour les valeurs par défaut, et un type/interface nommé pour le contrat global de la config.
   :::

