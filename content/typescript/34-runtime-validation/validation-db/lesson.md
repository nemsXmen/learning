---
id: typescript-34-validation-db
title: Validation DB
slug: validation-db
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-34-validation-des-variables-denvironnement]
skills: [validation]
tags: [typescript, validation, database]
---

## Objectifs

- Traiter les rows DB comme données externes
- Valider ou mapper proprement
- Gérer le drift schema DB / types

## Introduction

Même ta **base** peut diverger des types (migrations, données legacy, SQL brut).

## Concept

```ts
const row: unknown = await db.query(...);
const user = UserSchema.parse(row);
```

Avec un ORM typé (Prisma) : confiance plus élevée, mais attention aux `Json` fields et raw queries.

## Exemple

Valider les colonnes JSON, les imports de dumps, les lectures cross-service.

## Comment ça fonctionne

ORM typé = moins de friction. Validation schema = filet pour zones grises.

## Erreurs fréquentes

- as User sur un row SQL
- Types Prisma désynchronisés (pas de generate)

## À retenir

- Raw SQL → unknown → parse
- ORM : garder generate à jour
- JSON columns = validation

## Exercices

1. Pourquoi un champ Json en base est-il risqué sans validation ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Parce que son contenu est libre : le type TS ne garantit pas la forme réelle stockée.
   :::

## Questions d'entretien

1. Faut-il valider les données issues de ta propre DB ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Souvent oui pour le SQL brut, les colonnes JSON, les systèmes legacy ou multi-writers. Un ORM typé et des migrations strictes réduisent le besoin, mais ne l’éliminent pas partout.
   :::
