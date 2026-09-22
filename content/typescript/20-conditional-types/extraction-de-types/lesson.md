---
id: typescript-20-extraction-de-types
title: Extraction de types
slug: extraction-de-types
technology: typescript
level: advanced
module: 20-conditional-types
order: 7
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-20-recursive-conditional-types]
skills: [conditional-types]
tags: [typescript, conditional-types]
---

## Objectifs

- Extraire des types avec conditionals + infer
- Couvrir retours, args, éléments, promises
- Réutiliser les patterns standards

## Introduction

L’extraction de types est l’usage le plus fréquent des conditional types + infer.

## Concept

```ts
type ReturnType<T> = T extends (...args: any) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type ElementOf<T> = T extends readonly (infer U)[] ? U : never;
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;
```

## Exemple

```ts
type Props<C> = C extends React.ComponentType<infer P> ? P : never;
```

## Comment ça fonctionne

Le motif à droite de `extends` décrit la forme attendue ; `infer` capture les parties variables.

## Erreurs fréquentes

- Motif trop strict qui ne matche jamais
- Oublier les variantes (PromiseLike, readonly arrays…)

## À retenir

- infer + motif = extraction
- ReturnType / Parameters / Awaited
- Adapters pour bibliothèques (React, etc.)

## Exercices

1. Extrais le type des paramètres d’une fonction en tuple.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Params<T> = T extends (...args: infer P) => any ? P : never;
   ```
   :::

## Questions d'entretien

1. Comment extrait-on le type de retour d’une fonction avec un conditional type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec `T extends (...args: any) => infer R ? R : never` (c’est le principe de ReturnType).
   :::
