---
id: typescript-10-assertion-functions
title: Assertion functions
slug: assertion-functions
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 9
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-10-predicate-is]
skills: [type-narrowing]
tags: [typescript, asserts]
---

## Objectifs

- Comprendre les assertion functions
- Les distinguer des type guards classiques
- Voir le mot-clé `asserts`

## Introduction

Une **assertion function** vérifie une condition et throw si elle est fausse. TypeScript peut en tirer un narrowing.

## Concept

```ts
function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

function process(value: string | null) {
  assert(value !== null);
  // value est string ici
  console.log(value.toUpperCase());
}
```

## Exemple – asserts sur un type

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Not a string");
  }
}
```

## Comment ça fonctionne

Après l’appel à une assertion function, TypeScript considère que la condition (ou le prédicat) est vraie pour la suite du flux. Si la fonction throw, le flux s’arrête.

## Erreurs fréquentes

- Confondre avec un type guard qui retourne boolean
- Oublier de throw en cas d’échec

## À retenir

- `asserts condition` ou `asserts arg is Type`
- Narrowing par effet de bord (throw si faux)
- Utile pour les préconditions

## Exercices

1. Écris une assertion function `assertDefined` pour exclure null/undefined.

   :::solution
   ```ts
   function assertDefined<T>(value: T): asserts value is NonNullable<T> {
     if (value === null || value === undefined) {
       throw new Error("Value is null or undefined");
     }
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre un type guard (`is`) et une assertion function (`asserts`) ?

   :::reponse
   Un type guard retourne un boolean et permet un narrowing dans un if. Une assertion function throw en cas d’échec et narrow le type pour tout le code qui suit l’appel (si elle ne throw pas).
   :::
