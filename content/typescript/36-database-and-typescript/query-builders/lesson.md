---
id: typescript-36-query-builders
title: Query builders
slug: query-builders
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-36-transactions-typees]
skills: [database]
tags: [typescript, database]
---

## Objectifs

- Voir les query builders typés
- Knex, Kysely, Drizzle
- SQL sûr vs string brute

## Introduction

Les **query builders** construisent du SQL avec plus ou moins de typage.

## Concept

```ts
// idée Kysely / Drizzle
const users = await db
  .selectFrom("user")
  .select(["id", "email"])
  .where("email", "=", email)
  .execute();
```

## Exemple

Kysely et Drizzle visent un typage fort des tables/colonnes. Knex est plus dynamique.

## Comment ça fonctionne

Les schemas TS décrivent tables → autocomplete et checks sur colonnes. Moins d’erreurs de typos SQL.

## Erreurs fréquentes

- Concaténer du SQL string non validé
- Types de tables non régénérés

## À retenir

- Builders typés > SQL string
- Schema comme source
- Toujours possible d’échapper en raw (avec prudence)

## Exercices

1. Risque du SQL string non paramétré ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Injection SQL + aucune aide de typage sur les colonnes.
   :::

## Questions d'entretien

1. Pourquoi un query builder typé (Kysely/Drizzle) ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour bénéficier d’autocomplete, de vérification des noms de colonnes/tables, et réduire injections et typos, tout en gardant un contrôle proche du SQL.
   :::
