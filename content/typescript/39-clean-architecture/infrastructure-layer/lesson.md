---
id: typescript-39-infrastructure-layer
title: Infrastructure layer
slug: infrastructure-layer
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-application-layer]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Placer ORM, HTTP clients, mailers
- Implémenter les ports
- Contenir les détails techniques

## Introduction

L’**infrastructure** implémente les détails : DB, fichiers, APIs tierces.

## Concept

```ts
// infra/prisma-user-repository.ts
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } }).then(mapToUser);
  }
  save(user: User) {
    return this.prisma.user.upsert({ /* ... */ });
  }
}
```

## Exemple

Adapters email, queue, storage S3, cache Redis.

## Comment ça fonctionne

Cette couche dépend du domaine (interfaces) et des libs techniques. Elle ne contient pas les règles métier.

## Erreurs fréquentes

- Règles métier dans les repositories
- Types Prisma exposés vers le haut

## À retenir

- Adapters
- Mapping row ↔ domain
- Libs techniques ici

## Exercices

1. Où placer un client Stripe ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Dans infrastructure (adapter paiement), derrière un port domain/application.
   :::

## Questions d'entretien

1. Que met-on dans la couche infrastructure ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les implémentations techniques des ports : ORM, clients HTTP, fichiers, bus de messages, etc., avec mapping vers les types domaine.
   :::
