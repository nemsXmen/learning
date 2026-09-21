---
id: typescript-33-nestjs-plus-typescript
title: NestJS + TypeScript
slug: nestjs-plus-typescript
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Comprendre pourquoi NestJS est TypeScript-first
- Créer un projet Nest typé
- Voir le rôle des décorateurs et de la DI

## Introduction

**NestJS** est un framework Node backend conçu autour de TypeScript, inspiré d’Angular (modules, DI, décorateurs).

## Concept

```bash
npm i -g @nestjs/cli
nest new my-api
```

Structure typique : `src/main.ts`, `app.module.ts`, controllers, services.

## Exemple

```ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

## Comment ça fonctionne

Nest s’appuie sur les décorateurs TypeScript (`emitDecoratorMetadata`, `experimentalDecorators`) et la réflexion pour le wiring DI.

## Erreurs fréquentes

- Désactiver les options décorateurs dans tsconfig
- Mélanger style Express « nu » sans modules

## À retenir

- Nest = TS first
- CLI `nest new`
- Décorateurs + DI

## Exercices

1. Quelle commande CLI crée un projet Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `nest new <name>`
   :::

## Questions d'entretien

1. Pourquoi NestJS et TypeScript vont-ils de pair ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que Nest s’appuie sur les décorateurs, les métadonnées de types et l’injection de dépendances typée : le framework est conçu pour un codebase TypeScript structuré (modules, providers, DTOs).
   :::
