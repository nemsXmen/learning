---
id: typescript-36-domain-vers-api
title: Domain → API
slug: domain-vers-api
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-36-db-vers-domain]
skills: [database]
tags: [typescript, database, api]
---

## Objectifs

- Mapper domain → DTO API
- Sérialiser dates, value objects
- Garder le contrat stable

## Introduction

Le passage **Domain → API** produit les DTOs publics.

## Concept

```ts
function toUserDto(user: User): UserDto {
  return {
    id: user.id.value, // si UserId value object
    email: user.email.value,
    createdAt: user.createdAt.toISOString()
  };
}
```

## Exemple

Controllers/handlers appellent le mapper après le use-case.

## Comment ça fonctionne

Le domaine reste centré métier. L’API décide de la forme JSON (names, formats de date).

## Erreurs fréquentes

- Sérialiser des class instances non JSON-safe
- Exposer trop de champs domain

## À retenir

- Mapper sortant
- ISO strings pour dates
- Contrat API stable

## Exercices

1. Pourquoi toISOString() sur les dates dans un DTO ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   JSON n’a pas de type Date : les strings ISO sont le standard d’échange.
   :::

## Questions d'entretien

1. Comment évites-tu de coupler le domaine au JSON API ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En mappant explicitement domain → DTO dans la couche delivery (controller/handler), en sérialisant value objects et dates, sans exposer les types internes du domaine.
   :::
