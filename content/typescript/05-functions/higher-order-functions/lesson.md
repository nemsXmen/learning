---
id: typescript-05-higher-order-functions
title: Higher-order functions
slug: higher-order-functions
technology: typescript
level: beginner
module: 05-functions
order: 10
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-05-function-types]
skills: [functions]
tags: [typescript, functions, higher-order]
---

## Objectifs

- Comprendre ce qu’est une higher-order function
- Les typer correctement
- Voir des exemples concrets (map, filter, compose…)

## Introduction

Une **higher-order function** est une fonction qui prend une ou plusieurs fonctions en argument et/ou retourne une fonction.

## Concept

```ts
function withLogging<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: any[]) => {
    console.log("Appel", args);
    return fn(...args);
  }) as T;
}
```

Plus simple :

```ts
function applyTwice(fn: (n: number) => number, value: number): number {
  return fn(fn(value));
}

applyTwice(x => x * 2, 3); // 12
```

## Exemple

```ts
function createMultiplier(factor: number): (n: number) => number {
  return (n) => n * factor;
}

const double = createMultiplier(2);
double(5); // 10
```

## Comment ça fonctionne

On combine des function types pour décrire les entrées et sorties. Les generics rendent ces fonctions vraiment réutilisables.

## Erreurs fréquentes

- Typer trop vaguement (`Function`, `any`)
- Oublier de propager les types génériques

## À retenir

- Higher-order = fonction qui manipule des fonctions
- Très courant en programmation fonctionnelle et dans les APIs (map, filter, middleware…)
- Les function types + generics sont les outils clés

## Exercices

1. Écris une higher-order function `once` qui prend une fonction et s’assure qu’elle n’est exécutée qu’une seule fois.

   :::indice
   Garde un booléen dans la closure.
   :::

   :::solution
   ```ts
   function once<T extends (...args: any[]) => any>(fn: T): T {
     let called = false;
     let result: ReturnType<T>;
     return ((...args: any[]) => {
       if (!called) {
         called = true;
         result = fn(...args);
       }
       return result;
     }) as T;
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qu’une higher-order function ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Une fonction qui prend une ou plusieurs fonctions en paramètre et/ou retourne une fonction. Exemples : map, filter, createMultiplier, middlewares.
   :::

