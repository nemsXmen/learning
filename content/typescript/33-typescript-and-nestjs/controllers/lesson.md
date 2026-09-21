---
id: typescript-33-controllers
title: Controllers
slug: controllers
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-modules]
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Déclarer un `@Controller`
- Typer routes et handlers
- Utiliser param / body / query typés

## Introduction

Les **controllers** exposent les endpoints HTTP.

## Concept

```ts
import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

## Exemple

Préfixe `users` → `GET /users`, `POST /users`, etc.

## Comment ça fonctionne

Décorateurs de méthode (`@Get`, `@Post`) + décorateurs de params (`@Body`, `@Param`, `@Query`). Les types TS documentent ; la validation réelle passe souvent par pipes + class-validator.

## Erreurs fréquentes

- Logique métier dans le controller
- Body non typé / non validé

## À retenir

- @Controller
- Injection du service
- DTO pour le body

## Exercices

1. Ajoute un GET :id qui prend @Param("id") id: string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   @Get(":id")
   findOne(@Param("id") id: string) {
     return this.usersService.findOne(id);
   }
   ```
   :::

## Questions d'entretien

1. Quel est le rôle d’un controller Nest par rapport à un service ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le controller gère le transport HTTP (routes, status, DTO d’entrée). Le service encapsule la logique métier et l’accès data. On garde les controllers minces.
   :::
