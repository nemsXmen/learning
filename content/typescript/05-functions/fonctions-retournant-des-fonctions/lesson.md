---
id: typescript-05-fonctions-retournant-des-fonctions
title: Fonctions retournant des fonctions
slug: fonctions-retournant-des-fonctions
technology: typescript
level: beginner
module: 05-functions
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-05-higher-order-functions]
skills: [functions]
tags: [typescript, functions]
---

## Objectifs

- Écrire et typer des fonctions qui retournent d’autres fonctions
- Comprendre les closures typées
- Voir des cas d’usage (factories, partial application)

## Introduction

Retourner une fonction est un pattern très puissant (factories, configuration, partial application).

## Concept

```ts
function createGreeter(greeting: string): (name: string) => string {
  return (name) => `${greeting}, ${name}`;
}

const sayHello = createGreeter("Hello");
sayHello("Alice"); // "Hello, Alice"
```

Le type de retour est un function type.

## Exemple

```ts
function add(a: number): (b: number) => number {
  return (b) => a + b;
}

const add5 = add(5);
add5(3); // 8
```

## Comment ça fonctionne

La fonction interne capture les variables de la fonction externe (closure). TypeScript suit les types à travers cette capture.

## Erreurs fréquentes

- Oublier d’annoter le type de retour (function type)
- Perdre des types en utilisant `any` dans la factory

## À retenir

- Retourner une fonction = higher-order function
- Annoter clairement le function type de retour
- Les closures sont parfaitement supportées par TypeScript

## Exercices

1. Écris une fonction `createCounter` qui retourne une fonction sans argument incrémentant un compteur interne.

   :::solution
   ```ts
   function createCounter(): () => number {
     let count = 0;
     return () => ++count;
   }
   ```
   :::

## Questions d'entretien

1. Comment type-t-on une fonction qui retourne une autre fonction ?

   :::reponse
   En utilisant un function type comme type de retour, par exemple `: (name: string) => string` ou un type alias équivalent.
   :::
