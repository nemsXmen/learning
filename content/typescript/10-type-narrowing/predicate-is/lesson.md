---
id: typescript-10-predicate-is
title: Predicate is
slug: predicate-is
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-10-user-defined-type-guards]
skills: [type-narrowing]
tags: [typescript, type-guards, predicate]
---

## Objectifs

- Maîtriser la syntaxe `arg is Type`
- L’utiliser dans des filtres et des gardes
- Voir le lien avec `Array.filter`

## Introduction

Le prédicat `is` est au cœur des type guards personnalisés.

## Concept

```ts
function isString(x: unknown): x is string {
  return typeof x === "string";
}
```

Avec `filter` :

```ts
const values: (string | number)[] = ["a", 1, "b", 2];
const strings = values.filter(isString);
// strings: string[]
```

TypeScript reconnaît le prédicat et type correctement le résultat du filter.

## Exemple

```ts
function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
```

## Comment ça fonctionne

Le type de retour `arg is Type` indique au compilateur : « si je retourne true, alors arg est de type Type ».

## Erreurs fréquentes

- Utiliser `arg is Type` avec une logique incorrecte
- Oublier que le prédicat ne s’applique qu’à l’argument nommé

## À retenir

- `x is Type` = promesse de narrowing
- Très utile avec `filter`, `find`, gardes réutilisables
- La logique runtime doit être fiable

## Exercices

1. Écris un prédicat `isDefined` pour exclure null et undefined.

   :::solution
   ```ts
   function isDefined<T>(value: T | null | undefined): value is T {
     return value !== null && value !== undefined;
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi `Array.filter(isString)` produit-il un `string[]` plutôt qu’un `(string | number)[]` ?

   :::reponse
   Parce que `isString` a un type predicate `x is string`. TypeScript utilise cette information pour typ er le tableau filtré.
   :::
