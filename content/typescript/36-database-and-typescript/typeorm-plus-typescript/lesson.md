---
id: typescript-36-typeorm-plus-typescript
title: TypeORM + TypeScript
slug: typeorm-plus-typescript
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-36-query-builders]
skills: [database]
tags: [typescript, database, typeorm]
---

## Objectifs

- Voir le modèle TypeORM typé
- Entities classes + décorateurs
- Repository TypeORM

## Introduction

**TypeORM** utilise classes et décorateurs pour mapper les tables.

## Concept

```ts
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column({ select: false })
  passwordHash: string;
}
```

```ts
const users = await userRepo.find({ where: { email } });
```

## Exemple

Active Record ou Data Mapper. Attention : réflexion + décorateurs (tsconfig).

## Comment ça fonctionne

Métadonnées de décorateurs → mapping. Types TS sur les propriétés d’entity.

## Erreurs fréquentes

- Relations non typées / lazy surprises
- synchronize: true en prod

## À retenir

- @Entity / @Column
- Repository typé
- Migrations > synchronize prod

## Exercices

1. Décorateur pour une entity TypeORM ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `@Entity()`
   :::

## Questions d'entretien

1. TypeORM s’appuie sur quoi pour le mapping TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Sur des classes entity décorées (`@Entity`, `@Column`…) et les métadonnées émises par TypeScript, consommées au runtime par l’ORM.
   :::
