---
id: typescript-05-function-expressions
title: Function expressions
slug: function-expressions
technology: typescript
level: beginner
module: 05-functions
order: 6
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-05-parametres-rest]
skills: [functions]
tags: [typescript, functions]
---

## Objectifs

- Déclarer des fonctions sous forme d’expressions
- Les typer correctement
- Voir la différence avec les function declarations

## Introduction

Les function expressions assignent une fonction à une variable.

## Concept

```ts
const add = function (a: number, b: number): number {
  return a + b;
};
```

On peut aussi typer la variable :

```ts
const add: (a: number, b: number) => number = function (a, b) {
  return a + b;
};
```

Dans ce cas l’inférence contextuelle peut alléger les annotations à l’intérieur.

## Exemple

```ts
const greet = function (name: string) {
  return `Hello ${name}`;
};
```

## Comment ça fonctionne

Une function expression produit une valeur de type fonction. Elle peut être assignée, passée en argument, retournée, etc.

## Erreurs fréquentes

- Oublier que les function expressions ne sont pas hoistées comme les declarations
- Sur-annoter quand le contexte suffit

## À retenir

- `const fn = function (...) { ... }`
- Utile pour les callbacks et les assignations
- Le typage peut se faire sur la variable ou sur la fonction elle-même

## Exercices

1. Écris une function expression `isPositive` qui prend un number et retourne un boolean.

   :::solution
   ```ts
   const isPositive = function (n: number): boolean {
     return n > 0;
   };
   ```
   :::

## Questions d'entretien

1. Quelle est la différence principale entre une function declaration et une function expression ?

   :::reponse
   Les function declarations sont hoistées (disponibles avant leur ligne dans le scope). Les function expressions ne le sont pas ; elles suivent les règles de la variable à laquelle elles sont assignées (`const`/`let`).
   :::
