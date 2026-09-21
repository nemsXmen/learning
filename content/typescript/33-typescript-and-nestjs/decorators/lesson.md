---
id: typescript-33-decorators
title: Decorators
slug: decorators
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-generics]
skills: [nestjs]
tags: [typescript, nestjs, decorators]
---

## Objectifs

- Comprendre le rôle des décorateurs Nest
- Class / method / param decorators
- Lien avec les métadonnées

## Introduction

Nest est **piloté par décorateurs** : ils attachent des métadonnées lues au runtime.

## Concept

```ts
@Controller("cats")
export class CatsController {
  @Get()
  @HttpCode(200)
  findAll(): string[] {
    return ["cat"];
  }

  @Post()
  create(@Body() body: CreateCatDto) {}
}
```

## Exemple

`@Injectable`, `@Module`, `@Get`, `@Body`, `@Inject`…

## Comment ça fonctionne

Les décorateurs TypeScript enregistrent des métadonnées (reflect-metadata). Nest les interprète pour routing, DI, pipes, etc.

## Erreurs fréquentes

- Oublier experimentalDecorators
- Ordre des décorateurs mal compris

## À retenir

- Décorateurs = config déclarative
- Métadonnées runtime
- Partout dans Nest

## Exercices

1. Cite 3 décorateurs Nest courants.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   @Controller, @Get, @Injectable (aussi @Body, @Module…).
   :::

## Questions d'entretien

1. Quel rôle jouent les décorateurs dans NestJS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Ils déclarent routes, modules, injection, validation, etc. en attachant des métadonnées que le framework lit pour câbler l’application sans configuration impérative massive.
   :::
