---
id: typescript-12-migration-enum-vers-union
title: Migration enum vers union
slug: migration-enum-vers-union
technology: typescript
level: intermediate
module: 12-enums
order: 9
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-12-quand-eviter-les-enums]
skills: [enums]
tags: [typescript, enums, migration]
---

## Objectifs

- Migrer un enum vers une literal union
- Préserver les constantes nommées si besoin
- Le faire de façon progressive et sûre

## Introduction

Migrer des enums vers des literal unions est un refactor courant dans les bases modernes.

## Concept

### Avant

```ts
enum Status {
  Idle = "idle",
  Loading = "loading",
  Success = "success",
  Error = "error"
}

function setStatus(s: Status) {}
setStatus(Status.Loading);
```

### Après

```ts
type Status = "idle" | "loading" | "success" | "error";

const Status = {
  Idle: "idle",
  Loading: "loading",
  Success: "success",
  Error: "error"
} as const;

function setStatus(s: Status) {}
setStatus(Status.Loading); // toujours valide
```

## Exemple

On peut garder l’enum le temps de migrer les call sites, puis basculer le type.

## Comment ça fonctionne

1. Introduire le type union + l’objet `as const`
2. Remplacer les annotations `Status` (enum) par le type union
3. Mettre à jour les imports / usages
4. Supprimer l’enum

## Erreurs fréquentes

- Casser les call sites qui dépendent de l’objet enum
- Oublier `as const` (élargissement en string)

## À retenir

- Union + objet `as const` = remplacement idiomatique
- Migration progressive possible
- Tester les call sites runtime et types

## Exercices

1. Migre un string enum `Role` (Admin, User) vers union + const object.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Role = "admin" | "user";
   const Role = { Admin: "admin", User: "user" } as const;
   ```
   :::

## Questions d'entretien


1. Comment migres-tu un string enum vers une literal union sans tout casser ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   En introduisant le type union et un objet `as const` homonyme pour les constantes, en migrant progressivement les annotations de type, puis en supprimant l’enum une fois tous les call sites à jour.
   :::

