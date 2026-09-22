---
id: typescript-39-domain-layer
title: Domain layer
slug: domain-layer
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-separation-of-concerns]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Définir la couche domaine
- Types et règles purs
- Indépendance framework

## Introduction

Le **domaine** contient le cœur métier : entities, value objects, règles.

## Concept

```ts
// domain/user.ts
export type UserId = string & { readonly brand: unique symbol };

export type User = {
  id: UserId;
  email: Email;
  isActive: boolean;
};

export function deactivate(user: User): User {
  return { ...user, isActive: false };
}
```

## Exemple

Pas d’import Nest/Express/Prisma dans le domain.

## Comment ça fonctionne

Le domaine est pur TypeScript. Les autres couches dépendent de lui, pas l’inverse.

## Erreurs fréquentes

- Import d’ORM dans le domain
- Anémie totale (que des data classes sans règles)

## À retenir

- Règles métier ici
- Zéro framework
- Types expressifs

## Exercices

1. Le domain peut-il importer Prisma Client ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Non — dépendance inverse.
   :::

## Questions d'entretien

1. Que met-on dans la couche domaine TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Entities, value objects, règles et politiques métier, ports (interfaces) — sans détails HTTP, UI ou ORM.
   :::
