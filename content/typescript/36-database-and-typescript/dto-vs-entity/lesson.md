---
id: typescript-36-dto-vs-entity
title: DTO vs Entity
slug: dto-vs-entity
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-36-entity-types]
skills: [database]
tags: [typescript, database, dto]
---

## Objectifs

- Distinguer DTO et Entity
- Éviter d’exposer l’entity
- Mapper proprement

## Introduction

**Entity** = persistance. **DTO** = transfert (API, messages).

## Concept

```ts
// Entity
type UserEntity = {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
};

// DTO public
type UserDto = {
  id: string;
  email: string;
  role: "admin" | "user";
};

function toUserDto(entity: UserEntity): UserDto {
  const { passwordHash: _, ...dto } = entity;
  return dto;
}
```

## Exemple

CreateUserDto ≠ UserEntity (pas d’id, password en clair vs hash).

## Comment ça fonctionne

Le mapping est le garde-fou contre les fuites et le couplage.

## Erreurs fréquentes

- return entity dans le controller
- Même classe pour les deux

## À retenir

- Entity ≠ DTO
- Mapper
- Pas de secrets dans DTO

## Exercices

1. Que retire toUserDto ci-dessus ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   passwordHash.
   :::

## Questions d'entretien

1. Pourquoi ne pas exposer l’entity TypeORM/Prisma dans l’API ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce qu’elle contient souvent des champs internes/sensibles et couple le contrat public au schéma de base. Un DTO + mapper stabilise l’API.
   :::
