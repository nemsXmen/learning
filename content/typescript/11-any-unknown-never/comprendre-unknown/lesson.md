---
id: typescript-11-comprendre-unknown
title: Comprendre unknown
slug: comprendre-unknown
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-11-pourquoi-eviter-any]
skills: [any-unknown-never]
tags: [typescript, unknown]
---

## Objectifs

- Comprendre le type `unknown`
- Voir qu’il est type-safe (contrairement à `any`)
- Savoir quand l’utiliser

## Introduction

`unknown` représente une valeur dont on ne connaît pas encore le type. Contrairement à `any`, on ne peut pas l’utiliser librement sans narrowing.

## Concept

```ts
let value: unknown = 42;
value = "hello";
value = { x: 1 };

// value.toUpperCase(); // ❌
// value.foo(); // ❌

if (typeof value === "string") {
  value.toUpperCase(); // OK
}
```

Tout est assignable à `unknown`, mais `unknown` n’est assignable qu’à `unknown` et `any` (sans narrowing).

## Exemple

```ts
function parseJSON(text: string): unknown {
  return JSON.parse(text);
}
```

## Comment ça fonctionne

`unknown` force le développeur à prouver le type avant usage (typeof, type guards, assertions contrôlées, etc.).

## Erreurs fréquentes

- Utiliser `any` là où `unknown` suffirait
- Caster immédiatement `unknown` en un type sans validation

## À retenir

- `unknown` = « je ne sais pas encore »
- Type-safe : narrowing obligatoire
- Idéal pour les entrées externes (JSON, user input, APIs)

## Exercices

1. Déclare une variable `unknown` et narrow-la en string avant usage.

   :::solution
   ```ts
   const data: unknown = "hello";
   if (typeof data === "string") {
     console.log(data.toUpperCase());
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce que `unknown` et en quoi diffère-t-il de `any` ?

   :::reponse
   `unknown` représente une valeur de type inconnu mais reste type-safe : on doit la narrow avant de l’utiliser. `any` désactive purement et simplement le contrôle de types.
   :::
