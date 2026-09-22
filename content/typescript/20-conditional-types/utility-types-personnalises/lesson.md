---
id: typescript-20-utility-types-personnalises
title: Utility types personnalisés
slug: utility-types-personnalises
technology: typescript
level: advanced
module: 20-conditional-types
order: 8
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-20-extraction-de-types]
skills: [conditional-types]
tags: [typescript, conditional-types]
---

## Objectifs

- Créer des utilities basés sur des conditionals
- Combiner avec mapped types
- Documenter le comportement

## Introduction

Les conditional types sont le moteur de nombreux utility types custom.

## Concept

```ts
type NonNullable<T> = T extends null | undefined ? never : T;

type Flatten<T> = T extends any[] ? T[number] : T;

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
```

## Exemple

```ts
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
```

## Comment ça fonctionne

On combine distributivité, infer, mapped types et index access pour exprimer des requêtes riches sur les types.

## Erreurs fréquentes

- Utilities non testés sur des cas edge (any, never, unions)

## À retenir

- Conditionals = cœur des utilities
- Tester unions, never, any
- Noms expressifs

## Exercices

1. Écris un type qui extrait les noms de propriétés fonction d’un objet.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type FnKeys<T> = {
     [K in keyof T]: T[K] extends Function ? K : never;
   }[keyof T];
   ```
   :::

## Questions d'entretien

1. Comment conçois-tu un utility type personnalisé basé sur des conditionals ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Je pars d’un besoin précis, j’utilise extends/infer/mapped types, je gère la distributivité, et je valide le comportement sur des cas edge (unions, never, any, objets vides).
   :::
