---
id: typescript-36-entity-types
title: Entity types
slug: entity-types
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-36-modeles-de-donnees]
skills: [database]
tags: [typescript, database]
---

## Objectifs

- Typer les entities / rows
- Aligner avec le schema SQL
- Gérer les clés et timestamps

## Introduction

Les **entity types** reflètent la structure persistée.

## Concept

```ts
type OrderEntity = {
  id: string;
  userId: string;
  totalCents: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
};
```

Avec Prisma : types générés `Order`. Avec TypeORM : classes décorées.

## Exemple

Les enums SQL se mappent vers unions string ou enums TS.

## Comment ça fonctionne

ORM generate ou déclaration manuelle. La source de vérité reste le schema DB + migrations.

## Erreurs fréquentes

- Types désynchronisés après migration
- number pour des money sans stratégie claire

## À retenir

- Entity ≈ row
- Générer quand possible
- Migrations d’abord

## Exercices

1. Entity Product avec id, name, priceCents.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type ProductEntity = {
     id: string;
     name: string;
     priceCents: number;
   };
   ```
   :::

## Questions d'entretien

1. D’où devraient venir les types d’entity ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Idéalement générés depuis le schema (Prisma, Drizzle, etc.) ou maintenus en phase avec les migrations, pour éviter la dérive code/SQL.
   :::
