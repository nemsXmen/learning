---
id: typescript-36-query-result-types
title: Query result types
slug: query-result-types
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-36-repository-types]
skills: [database]
tags: [typescript, database]
---

## Objectifs

- Typer les résultats de requêtes
- Projections et joins
- Différencier list / one / aggregate

## Introduction

Chaque **query** a un type de résultat précis (row, projection, aggregate).

## Concept

```ts
type UserListItem = {
  id: string;
  email: string;
};

type UserWithOrders = User & {
  orders: Order[];
};

type CountResult = { count: number };
```

## Exemple

```ts
// Prisma
prisma.user.findMany({ select: { id: true, email: true } })
// type inféré sur la projection
```

## Comment ça fonctionne

Les ORM infèrent depuis select/include. En SQL brut, définir le type ou valider.

## Erreurs fréquentes

- any sur les joins
- Projection non alignée avec le type déclaré

## À retenir

- Types de projection
- Inférence ORM
- Aggregates typés

## Exercices

1. Type pour SELECT count(*) AS count.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type CountResult = { count: number };
   ```
   :::

## Questions d'entretien

1. Comment types-tu une requête avec projection partielle ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un type dédié (UserListItem) ou l’inférence de l’ORM sur le `select`. Éviter de réutiliser l’entity complète si des champs manquent.
   :::
