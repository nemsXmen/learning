---
id: typescript-10-user-defined-type-guards
title: User-defined type guards
slug: user-defined-type-guards
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 7
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-10-control-flow-analysis]
skills: [type-narrowing]
tags: [typescript, type-guards]
---

## Objectifs

- Créer ses propres type guards
- Comprendre le rôle des prédicats `is`
- Encapsuler la logique de narrowing

## Introduction

Quand les narrowings intégrés ne suffisent pas, on écrit des **user-defined type guards**.

## Concept

```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function process(value: unknown) {
  if (isString(value)) {
    // value est string ici
    console.log(value.toUpperCase());
  }
}
```

Le retour `value is string` est un **type predicate**.

## Exemple

```ts
interface Cat { meow(): void }
interface Dog { bark(): void }

function isCat(animal: Cat | Dog): animal is Cat {
  return "meow" in animal;
}
```

## Comment ça fonctionne

Si la fonction retourne `true`, TypeScript considère que le prédicat est vrai et narrow la variable en conséquence.

## Erreurs fréquentes

- Oublier le prédicat `is` (la fonction narrow alors seulement un boolean)
- Écrire une garde incorrecte (le runtime ne correspond pas au type)

## À retenir

- `value is Type` = type predicate
- Permet d’encapsuler des tests complexes
- La responsabilité de la correction repose sur le développeur

## Exercices

1. Écris un type guard `isNumber` pour `unknown`.

   :::solution
   ```ts
   function isNumber(value: unknown): value is number {
     return typeof value === "number" && !Number.isNaN(value);
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qu’un user-defined type guard ?

   :::reponse
   Une fonction qui retourne un type predicate (`arg is Type`). Quand elle retourne true, TypeScript narrow l’argument vers Type. Cela permet d’encapsuler des logiques de discrimination personnalisées.
   :::
