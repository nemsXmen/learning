---
id: typescript-36-champs-nullable
title: Champs nullable
slug: champs-nullable
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-36-query-result-types]
skills: [database]
tags: [typescript, database]
---

## Objectifs

- Mapper NULL SQL ↔ null | undefined
- Éviter les trous de nullability
- Strict null checks

## Introduction

Les colonnes **NULL** doivent apparaître dans les types.

## Concept

```ts
type ProfileEntity = {
  id: string;
  bio: string | null; // colonne nullable
  avatarUrl: string | null;
};
```

```ts
// Domaine peut préférer optional
type Profile = {
  id: string;
  bio?: string;
};
```

## Exemple

Prisma : `String?` → `string | null`. Attention null vs undefined.

## Comment ça fonctionne

`strictNullChecks` force le handling. Mapper null → undefined si le domain préfère optional.

## Erreurs fréquentes

- Oublier | null → crash sur .toUpperCase()
- Mélanger null et undefined sans convention

## À retenir

- NULL → null dans entity
- Convention domain claire
- strictNullChecks

## Exercices

1. Type d’une colonne text nullable en entity.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `string | null`
   :::

## Questions d'entretien

1. null SQL vs undefined TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   SQL NULL se mappe naturellement sur `null`. `undefined` signifie souvent « absent » en JS/TS. Choisir une convention de mapping et s’y tenir (surtout avec JSON/API).
   :::
