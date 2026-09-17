---
id: typescript-06-alias-fonctions
title: Alias de fonctions
slug: alias-fonctions
technology: typescript
level: beginner
module: 06-type-aliases
order: 3
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-06-alias-objets]
skills: [type-aliases]
tags: [typescript, type-aliases, functions]
---

## Objectifs

- Créer des type aliases pour des signatures de fonctions
- Les réutiliser pour les callbacks et les variables
- Améliorer la lisibilité des APIs

## Introduction

Nommer les function types rend les signatures beaucoup plus claires.

## Concept

```ts
type BinaryOp = (a: number, b: number) => number;

const add: BinaryOp = (a, b) => a + b;
const multiply: BinaryOp = (a, b) => a * b;
```

Pour les callbacks :

```ts
type Predicate<T> = (value: T) => boolean;

function filter<T>(items: T[], pred: Predicate<T>): T[] {
  return items.filter(pred);
}
```

## Exemple

```ts
type EventHandler = (event: Event) => void;
const onClick: EventHandler = (e) => console.log(e);
```

## Comment ça fonctionne

Le type alias encapsule la syntaxe `(params) => ReturnType` sous un nom réutilisable.

## Erreurs fréquentes

- Répéter la même signature de callback partout
- Utiliser `Function` ou `any` à la place d’un alias précis

## À retenir

- `type Fn = (args) => Return` pour nommer les signatures
- Très utile pour les callbacks et les stratégies
- Améliore fortement la lisibilité

## Exercices

1. Crée un type `Mapper<T, U>` pour `(value: T) => U`.

   :::solution
   ```ts
   type Mapper<T, U> = (value: T) => U;
   ```
   :::

## Questions d'entretien

1. Pourquoi créer un type alias pour une signature de fonction ?

   :::reponse
   Pour documenter l’intention, réutiliser la signature à plusieurs endroits, et éviter les annotations inline répétitives et moins lisibles.
   :::
