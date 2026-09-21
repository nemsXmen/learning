---
id: typescript-19-modifier-readonly
title: Modifier readonly
slug: modifier-readonly
technology: typescript
level: advanced
module: 19-mapped-types
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-19-modifier-optional]
skills: [mapped-types]
tags: [typescript, mapped-types]
---

## Objectifs

- Ajouter et retirer `readonly` dans un mapped type
- Comprendre `readonly` et `-readonly`
- Reproduire Readonly et Mutable

## Introduction

On contrôle le caractère readonly des propriétés mappées.

## Concept

```ts
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};
```

## Exemple

```ts
type FrozenUser = Readonly<{ id: number; name: string }>;
type Editable = Mutable<FrozenUser>;
```

## Comment ça fonctionne

`readonly` empêche la réaffectation. `-readonly` la réautorise au niveau des types.

## Erreurs fréquentes

- Croire que readonly est profond

## À retenir

- `readonly` / `-readonly`
- Readonly vs Mutable
- Superficiel par défaut

## Exercices

1. Écris un type Mutable qui retire readonly.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Mutable<T> = { -readonly [K in keyof T]: T[K] };
   ```
   :::

## Questions d'entretien

1. Comment retire-t-on readonly dans un mapped type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec le modifier `-readonly` : `{ -readonly [K in keyof T]: T[K] }`.
   :::
