---
id: typescript-36-db-vers-domain
title: DB → Domain
slug: db-vers-domain
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-36-postgresql-plus-typescript]
skills: [database]
tags: [typescript, database, architecture]
---

## Objectifs

- Mapper rows vers le domaine
- Encapsuler invariants
- Value objects typés

## Introduction

Le passage **DB → Domain** enrichit et sécurise les données brutes.

## Concept

```ts
function toUser(row: UserRow): User {
  return {
    id: UserId.parse(row.id),
    email: Email.parse(row.email),
    createdAt: row.created_at
  };
}
```

## Exemple

Value objects (`Email`, `Money`) valident des invariants que la DB seule ne garantit pas toujours.

## Comment ça fonctionne

Le repository mappe row → domain avant de rendre au service. Le domaine ne parle plus SQL.

## Erreurs fréquentes

- Domain saturé de types ORM
- Invariants seulement en DB (et contournés)

## À retenir

- Mapper au boundary repo
- Value objects
- Domaine pur

## Exercices

1. Où placer toUser(row) idéalement ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Dans la couche repository / mapper infra → domain.
   :::

## Questions d'entretien

1. Pourquoi mapper DB → Domain plutôt que d’utiliser les rows partout ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour isoler le métier des détails de persistance, appliquer des invariants (value objects), et garder un modèle stable même si le schema SQL évolue.
   :::
