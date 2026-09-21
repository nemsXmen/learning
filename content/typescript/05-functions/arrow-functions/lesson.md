---
id: typescript-05-arrow-functions
title: Arrow functions
slug: arrow-functions
technology: typescript
level: beginner
module: 05-functions
order: 7
estimatedMinutes: 15
difficulty: 1
xp: 45
prerequisites: [typescript-05-function-expressions]
skills: [functions]
tags: [typescript, functions, arrow]
---

## Objectifs

- Écrire des arrow functions typées
- Connaître les particularités (`this`, return implicite)
- Les utiliser dans les callbacks

## Introduction

Les arrow functions sont la forme moderne et concise des fonctions en JavaScript/TypeScript.

## Concept

```ts
const add = (a: number, b: number): number => {
  return a + b;
};

// Forme concise (return implicite)
const add2 = (a: number, b: number): number => a + b;
```

Avec un seul paramètre on peut omettre les parenthèses (mais l’annotation de type les force souvent) :

```ts
const double = (n: number) => n * 2;
```

## Exemple

```ts
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => n * 2); // contextual typing
```

Grâce au contextual typing, on peut souvent omettre les annotations dans les callbacks.

## Comment ça fonctionne

Les arrow functions n’ont pas leur propre `this` (elles capturent celui du scope englobant). Elles sont parfaites pour les callbacks et les méthodes qui ne dépendent pas de `this`.

## Erreurs fréquentes

- Utiliser une arrow function comme méthode d’objet quand on a besoin de `this` dynamique
- Oublier les types quand le contexte ne suffit pas

## À retenir

- Syntaxe concise et moderne
- Pas de `this` propre
- Excellent pour les callbacks (map, filter, etc.)
- Le contextual typing allège souvent les annotations

## Exercices

1. Réécris une fonction `isEven` en arrow function.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   const isEven = (n: number): boolean => n % 2 === 0;
   ```
   :::

## Questions d'entretien


1. Quelle est la différence de comportement de `this` entre une arrow function et une function classique ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Une function classique a son propre `this` (déterminé à l’appel). Une arrow function capture le `this` lexical du scope englobant et ne le redéfinit pas.
   :::

