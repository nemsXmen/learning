---
id: typescript-33-dtos
title: DTOs
slug: dtos
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-dependency-injection]
skills: [nestjs]
tags: [typescript, nestjs, dto]
---

## Objectifs

- Définir des DTO typés
- Combiner avec class-validator
- Séparer input et entities

## Introduction

Les **DTO** (Data Transfer Objects) typent et valident les données entrantes.

## Concept

```ts
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

```ts
@Post()
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

## Exemple

`ValidationPipe` global transforme et valide selon les décorateurs class-validator.

## Comment ça fonctionne

Les classes DTO existent à runtime (contrairement aux interfaces) : validation + types.

## Erreurs fréquentes

- Interface seule sans validation runtime
- Réutiliser l’entity DB comme DTO public

## À retenir

- class DTO + validators
- ValidationPipe
- Ne pas exposer l’entity brute

## Exercices

1. DTO avec name: string (@IsString) et age: number (@IsInt).

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export class CreatePersonDto {
     @IsString() name: string;
     @IsInt() age: number;
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi des classes DTO plutôt que des interfaces pour les body Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que les classes existent à runtime et permettent à class-validator / ValidationPipe de lire les décorateurs et de valider réellement les payloads. Les interfaces sont effacées.
   :::
