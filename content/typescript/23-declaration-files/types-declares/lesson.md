---
id: typescript-23-types-declares
title: Types déclarés
slug: types-declares
technology: typescript
level: intermediate
module: 23-declaration-files
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-23-classes-declarees]
skills: [declaration-files]
tags: [typescript, declaration-files]
---

## Objectifs

- Déclarer types, interfaces, enums dans un .d.ts
- Exporter les types pour les consommateurs
- Séparer types et valeurs

## Introduction

Les `.d.ts` exportent aussi des types purs.

## Concept

```ts
export interface User {
  id: string;
  name: string;
}

export type ID = string | number;

export enum Status {
  Idle,
  Loading,
  Done
}
```

Enums dans un `.d.ts` : attention, un enum « réel » peut nécessiter une émission runtime selon la forme (const enum vs enum).

## Exemple

```ts
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

## Comment ça fonctionne

Les types exportés sont visibles à l’import. Les interfaces et type aliases n’ont pas de runtime.

## Erreurs fréquentes

- Enum runtime dans un .d.ts sans implémentation correspondante
- Oublier d’exporter les types publics

## À retenir

- interface / type / enum dans les .d.ts
- Export explicite pour les consommateurs
- Préférer type/interface pour le purement type-level

## Exercices

1. Exporte une interface `Point` avec x et y number.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export interface Point {
     x: number;
     y: number;
   }
   ```
   :::

## Questions d'entretien

1. Peut-on exporter des types depuis un `.d.ts` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Oui. Les interfaces, type aliases et éventuellement enums déclarés et exportés sont consommables par les projets TypeScript qui importent le module.
   :::
