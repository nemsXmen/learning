---
id: typescript-42-transformations-de-types
title: Transformations de types
slug: type-level-transformations-de-types
technology: typescript
level: advanced
module: 42-type-level-programming
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-42-les-types-comme-langage]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Transformer une forme en une autre
- Utilitaires de base
- Composer des transformations

## Introduction

Une grande partie du type-level consiste à **transformer** des types.

## Concept

```ts
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Partial<T> = { [K in keyof T]?: T[K] };
type NullableProps<T> = { [K in keyof T]: T[K] | null };
```

## Exemple

Enchaîner : `Partial<Readonly<User>>`.

## Comment ça fonctionne

Mapped + operators produisent de nouveaux types structurels.

## Erreurs fréquentes

- Transformer trop tôt (any)
- Perdre des modifiers (readonly, optional)

## À retenir

- Mapped transforms
- Composition
- Préservation des modifiers

## Exercices

1. Partial\<{ a: string }\> ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `{ a?: string }`
   :::

## Questions d'entretien

1. Donne un exemple de transformation de type courante.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `Partial`, `Readonly`, `Pick`, `Omit`, ou des mapped types custom comme rendre toutes les props nullable.
   :::
