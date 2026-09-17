---
id: typescript-05-typage-des-parametres
title: Typage des paramètres
slug: typage-des-parametres
technology: typescript
level: beginner
module: 05-functions
order: 1
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-04-typage-des-objets]
skills: [functions]
tags: [typescript, functions, parameters]
---

## Objectifs

- Annoter correctement les paramètres d’une fonction
- Comprendre pourquoi c’est une frontière importante
- Voir l’inférence contextuelle dans certains cas

## Introduction

Les paramètres sont l’une des frontières les plus importantes à typer. Ils définissent le contrat d’entrée de la fonction.

## Concept

```ts
function greet(name: string, age: number) {
  console.log(`Hello ${name}, you are ${age}`);
}

greet("Alice", 30); // OK
// greet(30, "Alice"); // ❌
```

Sans annotation (et sans contextual typing), TypeScript infère `any` en mode non-strict, ou exige une annotation en mode `noImplicitAny`.

## Exemple

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

## Comment ça fonctionne

Chaque paramètre peut recevoir une annotation `: Type`. TypeScript vérifie ensuite les arguments fournis à l’appel.

## Erreurs fréquentes

- Oublier d’annoter les paramètres et se retrouver avec `any`
- Inverser l’ordre des types
- Annoter trop peu les fonctions publiques

## À retenir

- Annoter systématiquement les paramètres des fonctions publiques
- C’est un contrat clair pour les appelants
- En mode strict, `noImplicitAny` t’y oblige

## Exercices

1. Écris une fonction `multiply` qui prend deux numbers et retourne leur produit.

   :::solution
   ```ts
   function multiply(a: number, b: number): number {
     return a * b;
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi est-il important de typer les paramètres de fonctions ?

   :::reponse
   Parce qu’ils constituent le contrat d’entrée. Un typage correct permet au compilateur et à l’éditeur de détecter les appels incorrects, d’améliorer l’autocomplétion et de documenter l’intention.
   :::
