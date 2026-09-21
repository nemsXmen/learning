---
id: typescript-05-function-types
title: Function types
slug: function-types
technology: typescript
level: beginner
module: 05-functions
order: 9
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-05-callbacks-types]
skills: [functions]
tags: [typescript, functions, types]
---

## Objectifs

- Déclarer des function types
- Les utiliser dans des type aliases et des interfaces
- Comprendre la syntaxe `(params) => ReturnType`

## Introduction

Les function types permettent de nommer et réutiliser des signatures de fonctions.

## Concept

```ts
type BinaryOp = (a: number, b: number) => number;

const add: BinaryOp = (a, b) => a + b;
const multiply: BinaryOp = (a, b) => a * b;
```

Avec une interface (style call signature) :

```ts
interface BinaryOp {
  (a: number, b: number): number;
}
```

## Exemple

```ts
type Mapper<T, U> = (value: T) => U;

function map<T, U>(items: T[], mapper: Mapper<T, U>): U[] {
  return items.map(mapper);
}
```

## Comment ça fonctionne

Un function type décrit les paramètres et le retour sans fournir d’implémentation. Il sert de contrat pour les variables, paramètres et propriétés qui doivent être des fonctions.

## Erreurs fréquentes

- Confondre la syntaxe de type `(a: number) => number` avec une arrow function
- Oublier les parenthèses autour des paramètres dans le type

## À retenir

- Syntaxe : `(param: Type) => ReturnType`
- Très utile pour les callbacks et les stratégies
- Peut être nommé via `type` ou `interface`

## Exercices

1. Crée un type `Predicate<T>` pour une fonction `(value: T) => boolean`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Predicate<T> = (value: T) => boolean;
   ```
   :::

## Questions d'entretien


1. Comment déclare-t-on un type de fonction en TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Avec la syntaxe `(param: Type) => ReturnType`, souvent encapsulée dans un type alias ou une interface avec call signature.
   :::

