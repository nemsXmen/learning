---
id: typescript-08-string-or-number
title: string | number
slug: string-or-number
technology: typescript
level: beginner
module: 08-union-and-intersection
order: 2
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-08-types-union]
skills: [unions-intersections]
tags: [typescript, unions]
---

## Objectifs

- Travailler concrètement avec `string | number`
- Pratiquer le narrowing de base
- Voir des cas d’usage courants

## Introduction

`string | number` est l’une des unions les plus fréquentes (IDs, valeurs de formulaires, etc.).

## Concept

```ts
function formatId(id: string | number): string {
  if (typeof id === "string") {
    return id.toUpperCase();
  }
  return id.toFixed(0);
}
```

Le `typeof` permet de narrow le type dans chaque branche.

## Exemple

```ts
type FlexibleId = string | number;

function fetchItem(id: FlexibleId) {
  const key = String(id);
  // ...
}
```

## Comment ça fonctionne

Après un test `typeof`, TypeScript restreint le type dans le bloc correspondant.

## Erreurs fréquentes

- Oublier le narrowing et appeler des méthodes spécifiques
- Utiliser `==` au lieu de `typeof` ou de tests plus précis

## À retenir

- `string | number` est très courant
- `typeof` est le narrowing de base
- Toujours traiter les deux cas

## Exercices

1. Écris une fonction qui accepte `string | number` et retourne sa longueur (nombre de caractères ou nombre de chiffres).

   :::solution
   ```ts
   function lengthOf(value: string | number): number {
     if (typeof value === "string") return value.length;
     return String(value).length;
   }
   ```
   :::

## Questions d'entretien

1. Comment accède-t-on à des méthodes spécifiques sur une union `string | number` ?

   :::reponse
   En faisant un narrowing (par exemple avec `typeof`) pour réduire l’union à un seul membre dans chaque branche.
   :::
