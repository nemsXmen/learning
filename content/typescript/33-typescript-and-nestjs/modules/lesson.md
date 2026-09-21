---
id: typescript-33-modules
title: Modules
slug: modules
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-nestjs-plus-typescript]
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Déclarer un `@Module`
- Organiser imports / controllers / providers
- Exporter des providers

## Introduction

Le **module** est l’unité d’organisation Nest.

## Concept

```ts
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
```

## Exemple

`AppModule` importe les feature modules.

## Comment ça fonctionne

Le décorateur `@Module` décrit le graphe DI de ce slice d’application. `exports` rend un provider disponible aux modules importateurs.

## Erreurs fréquentes

- Provider utilisé mais non déclaré / non importé
- Cycles de modules

## À retenir

- @Module
- controllers / providers / imports / exports
- Feature modules

## Exercices

1. Déclare un module avec un controller et un service.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   @Module({
     controllers: [ItemsController],
     providers: [ItemsService]
   })
   export class ItemsModule {}
   ```
   :::

## Questions d'entretien

1. À quoi sert `exports` dans un module Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À exposer des providers aux autres modules qui importent celui-ci, sans les rendre globaux pour toute l’application.
   :::
