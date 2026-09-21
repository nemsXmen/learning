---
id: typescript-36-postgresql-plus-typescript
title: PostgreSQL + TypeScript
slug: postgresql-plus-typescript
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-36-typeorm-plus-typescript]
skills: [database]
tags: [typescript, database, postgresql]
---

## Objectifs

- Typer l’accès PostgreSQL
- Drivers et libs (pg, postgres.js, Prisma, Drizzle)
- Types Postgres ↔ TS

## Introduction

**PostgreSQL** est souvent accédé via des clients typés ou des ORM.

## Concept

```ts
import pg from "pg";
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

const res = await pool.query<{ id: string; email: string }>(
  "SELECT id, email FROM users WHERE id = $1",
  [id]
);
const row = res.rows[0]; // typé si générique fourni
```

## Exemple

Prisma/Drizzle génèrent des clients sûrs. `pg` brut nécessite discipline de typage.

## Comment ça fonctionne

Les génériques de `query<T>` documentent le shape. Les valeurs restent à valider si le SQL est dynamique.

## Erreurs fréquentes

- query sans générique → any
- Mauvais mapping timestamp / uuid / jsonb

## À retenir

- query\<T\> ou ORM
- Paramètres $1 (pas de concat)
- jsonb → unknown → parse

## Exercices

1. Pourquoi préférer $1 aux template strings non échappés ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour éviter les injections SQL.
   :::

## Questions d'entretien

1. Comment types-tu les résultats `pg` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En fournissant un générique à `query<T>` aligné sur le SELECT, ou en validant les rows avec un schema. Pour jsonb, traiter comme unknown puis parser.
   :::
