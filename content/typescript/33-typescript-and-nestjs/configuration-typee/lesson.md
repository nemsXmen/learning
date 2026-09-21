---
id: typescript-33-configuration-typee
title: Configuration typée
slug: 33-configuration-typee
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 16
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-custom-decorators]
skills: [nestjs]
tags: [typescript, nestjs, config]
---

## Objectifs

- Utiliser @nestjs/config
- Typer la configuration
- Valider au démarrage

## Introduction

La config Nest se centralise et se type comme le reste de l’app.

## Concept

```ts
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT ?? "3000", 10),
  databaseUrl: process.env.DATABASE_URL
});

// validation via class + class-validator ou Joi/Zod
```

```ts
ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
  validationSchema: /* Joi */ undefined
});
```

```ts
constructor(private config: ConfigService) {
  const port = this.config.get<number>("port");
}
```

## Exemple

Namespaces : `config.get("database.host")`.

## Comment ça fonctionne

ConfigService lit les valeurs ; le typage get<T> est une aide — la validation au boot reste essentielle.

## Erreurs fréquentes

- get sans validation → undefined surprise
- Secrets en clair dans le repo

## À retenir

- ConfigModule
- validation au boot
- get<T> + types

## Exercices

1. Lis port via config.get<number>("port").

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const port = this.config.get<number>("port");
   ```
   :::

## Questions d'entretien

1. Comment types-tu la configuration dans Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec ConfigModule, un objet de config (ou namespaces), une validation au démarrage (Joi/Zod/class-validator), et ConfigService.get<T> pour la consommation typée.
   :::
