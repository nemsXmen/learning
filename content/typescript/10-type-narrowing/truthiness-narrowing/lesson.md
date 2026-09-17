---
id: typescript-10-truthiness-narrowing
title: Truthiness narrowing
slug: truthiness-narrowing
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-10-narrowing-egalite]
skills: [type-narrowing]
tags: [typescript, narrowing]
---

## Objectifs

- Comprendre le truthiness narrowing
- Savoir ce qui est considéré falsy
- L’utiliser avec prudence

## Introduction

Un test « if (value) » narrow en excluant les valeurs falsy.

## Concept

Valeurs falsy en JavaScript : `false`, `0`, `""`, `null`, `undefined`, `NaN`.

```ts
function print(value: string | null | undefined) {
  if (value) {
    // value est string (et non vide)
    console.log(value.toUpperCase());
  }
}
```

## Exemple

```ts
function getLength(str: string | null) {
  if (str) {
    return str.length;
  }
  return 0;
}
```

## Comment ça fonctionne

TypeScript exclut les types qui ne peuvent être que falsy (ou les parties falsy des unions) dans la branche truthy.

## Erreurs fréquentes

- Éliminer `0` ou `""` alors qu’ils sont des valeurs valides
- Utiliser le truthiness quand un test explicite (`!== null`) serait plus sûr

## À retenir

- `if (value)` exclut les falsy
- Pratique mais attention aux `0` et `""`
- Préférer des tests explicites quand 0 / "" sont légitimes

## Exercices

1. Montre un cas où le truthiness narrowing est problématique avec un `number | undefined`.

   :::solution
   ```ts
   function f(n: number | undefined) {
     if (n) {
       // 0 est exclu alors que c’est un number valide
     }
   }
   ```
   :::

## Questions d'entretien

1. Quel est le risque du truthiness narrowing avec des numbers ?

   :::reponse
   `0` est falsy : un test `if (n)` exclut `0` en plus de `undefined`/`null`, ce qui peut être incorrect si `0` est une valeur métier valide.
   :::
