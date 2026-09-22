---
id: typescript-13-generic-constraints
title: Generic constraints
slug: generic-constraints
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 10
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-13-valeurs-par-defaut]
skills: [generics]
tags: [typescript, generics, constraints]
---

## Objectifs

- Restreindre un paramètre de type avec `extends`
- Accéder à des propriétés de façon sûre
- Voir des contraintes courantes

## Introduction

Sans contrainte, `T` est trop large : on ne peut presque rien faire dessus. Les **constraints** limitent `T` à un sous-ensemble de types.

## Concept

```ts
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

getLength("hello");     // OK
getLength([1, 2, 3]);   // OK
// getLength(42);       // ❌ number n’a pas length
```

```ts
function getId<T extends { id: string }>(entity: T): string {
  return entity.id;
}
```

## Exemple

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
```

## Comment ça fonctionne

`T extends Constraint` signifie que `T` doit être assignable à `Constraint`. TypeScript autorise alors l’accès aux membres de la contrainte.

## Erreurs fréquentes

- Oublier la contrainte et essayer d’accéder à une propriété
- Contraintes trop strictes qui limitent inutilement

## À retenir

- `T extends Constraint`
- Permet d’utiliser les propriétés de la contrainte
- Essentiel pour les generics utiles

## Exercices

1. Écris une fonction `hasId` contrainte à `{ id: string }` qui retourne l’id.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function hasId<T extends { id: string }>(obj: T): string {
     return obj.id;
   }
   ```
   :::

## Questions d'entretien

1. À quoi sert une contrainte générique (`extends`) ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À limiter le paramètre de type à un sous-ensemble de types (ceux assignables à la contrainte). Cela permet d’accéder de façon sûre aux propriétés ou méthodes garanties par la contrainte.
   :::
