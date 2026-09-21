---
id: typescript-33-custom-decorators
title: Custom decorators
slug: custom-decorators
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 15
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-33-exception-filters]
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Créer des décorateurs custom
- Param decorators (createParamDecorator)
- Metadata decorators (SetMetadata)

## Introduction

Nest permet d’**étendre** le système de décorateurs.

## Concept

```ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as User;
  }
);

@Get("me")
me(@CurrentUser() user: User) {
  return user;
}
```

```ts
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
```

## Exemple

@Public() pour skip auth, @CurrentUser(), @Roles("admin").

## Comment ça fonctionne

createParamDecorator extrait une valeur de l’ExecutionContext. SetMetadata + Reflector alimentent guards/interceptors.

## Erreurs fréquentes

- Typer user en any
- Metadata non lue correctement

## À retenir

- createParamDecorator
- SetMetadata + Reflector
- DX des handlers

## Exercices

1. Esquisse @CurrentUser() qui retourne req.user.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export const CurrentUser = createParamDecorator((_d, ctx: ExecutionContext) =>
     ctx.switchToHttp().getRequest().user
   );
   ```
   :::

## Questions d'entretien

1. À quoi sert createParamDecorator ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À fabriquer un décorateur de paramètre custom qui extrait une valeur (user, tenant, headers…) depuis l’ExecutionContext et la injecte typée dans le handler.
   :::
