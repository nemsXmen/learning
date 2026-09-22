---
id: typescript-18-required
title: Required
slug: required
technology: typescript
level: intermediate
module: 18-utility-types
order: 2
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-18-partial]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `Required<T>`
- Rendre toutes les propriétés obligatoires
- Voir l’opposé de Partial

## Introduction

`Required<T>` enlève l’optionalité de toutes les propriétés de `T`.

## Concept

```ts
type Config = { host?: string; port?: number };
type FullConfig = Required<Config>;
// { host: string; port: number }
```

## Exemple

Utile après fusion de defaults pour garantir la présence des champs.

## Comment ça fonctionne

Équivalent à `{ [K in keyof T]-?: T[K] }`.

## Erreurs fréquentes

- L’appliquer à des types qui doivent rester partiellement optionnels

## À retenir

- `Required<T>` = tout obligatoire
- Inverse de Partial
- Post-defaults / validation de forme complète

## Exercices

1. Applique Required à `{ a?: number; b?: string }`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type T = Required<{ a?: number; b?: string }>;
   // { a: number; b: string }
   ```
   :::

## Questions d'entretien

1. Que fait `Required<T>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il rend toutes les propriétés de T obligatoires en retirant le modifier `?`.
   :::
