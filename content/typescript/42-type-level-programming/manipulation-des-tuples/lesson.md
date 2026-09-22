---
id: typescript-42-manipulation-des-tuples
title: Manipulation des tuples
slug: manipulation-des-tuples
technology: typescript
level: advanced
module: 42-type-level-programming
order: 8
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-infer]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Head / Tail / Length
- Concat de tuples
- Variadic tuple types

## Introduction

Les **tuples** se manipulent finement au type-level.

## Concept

```ts
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
type Length<T extends any[]> = T["length"];

type Concat<A extends any[], B extends any[]> = [...A, ...B];
```

## Exemple

Variadic : `type F<T extends any[]> = (...args: [...T, string]) => void`.

## Comment ça fonctionne

infer + rest dans les patterns de tuples. Les spreads préservent les longueurs.

## Erreurs fréquentes

- Traiter tuples comme arrays ouverts
- Perdre les labels de tuple

## À retenir

- infer head/tail
- Spread
- length

## Exercices

1. Head\<[1, 2, 3]\> (type) ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   1 (littéral) si tuple de littéraux, sinon number selon définition.
   :::

## Questions d'entretien

1. À quoi servent les variadic tuple types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À typer des fonctions et structures avec un nombre variable d’éléments tout en préservant positions et types exacts (composition de paramètres, middleware, etc.).
   :::
