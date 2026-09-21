---
id: typescript-01-inference-de-types
title: Inférence de types
slug: inference-de-types
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 11
estimatedMinutes: 20
difficulty: 2
xp: 50
prerequisites: [typescript-01-quest-ce-que-typescript]
skills: [typescript-basics]
tags: [typescript, inference, types]
---

## Objectifs

- Comprendre ce qu’est l’inférence de types
- Savoir quand TypeScript devine correctement les types
- Éviter de sur-annoter
- Reconnaître les limites de l’inférence

## Introduction

L’une des grandes forces de TypeScript est qu’il **infère** (devine) les types dans de nombreux cas. Tu n’as pas besoin d’annoter absolument tout.

## Concept

Quand tu écris :

```ts
let count = 10;
```

TypeScript infère que `count` est de type `number`. C’est équivalent à :

```ts
let count: number = 10;
```

L’inférence fonctionne pour :

- Les variables initialisées
- Les valeurs de retour des fonctions
- Les contextes de tableaux et d’objets
- Les generics dans de nombreux cas

### Règle pratique

**Annoter les frontières, laisser l’inférence à l’intérieur.**

- Paramètres de fonctions publiques → annoter
- Valeurs de retour publiques → souvent annoter
- Variables locales → laisser l’inférence

## Exemple

```ts
// Inférence simple
const message = "Hello";          // string
const scores = [10, 20, 30];      // number[]
const user = { name: "Alice", age: 30 }; // { name: string; age: number }

// Inférence de retour
function add(a: number, b: number) {
  return a + b;                   // retour inféré : number
}

// Contexte
const nums = [1, 2, 3];
nums.push(4);                     // OK
nums.push("4");                   // ❌
```

## Comment ça fonctionne

TypeScript analyse le côté droit de l’affectation et les instructions de retour pour déterminer le type le plus précis possible. Il utilise aussi le *contextual typing* (le type attendu par le contexte influence l’inférence).

## Erreurs fréquentes

- Annoter *absolument tout*  
  Ça rend le code verbeux sans gain.

- Croire que l’inférence est toujours parfaite  
  Sur les objets complexes ou les structures récursives, elle a des limites.

- Utiliser `let` sans initialisation  
  ```ts
  let value; // any (ou erreur en mode strict)
  ```

## À retenir

- TypeScript infère beaucoup de types tout seul
- Annoter les API publiques et les frontières
- Laisser l’inférence travailler à l’intérieur des fonctions
- L’inférence + le mode strict = excellent équilibre

## Exercices

1. Sans annotation explicite, quel type TypeScript infère-t-il pour `const list = [1, "two", true];` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   `(string | number | boolean)[]`
   :::


2. Pourquoi ce code pose-t-il problème en mode strict ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

```ts
let x;
x = 10;
x = "hello";
```

   :::solution
   `x` est inféré comme `any` (ou provoque une erreur noImplicitAny). On perd la sécurité des types.
   :::

## Questions d'entretien


1. Qu’est-ce que l’inférence de types en TypeScript et pourquoi est-elle importante ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   C’est la capacité du compilateur à deviner le type d’une variable ou d’une expression sans annotation explicite. Elle réduit la verbosité tout en conservant la sécurité. La bonne pratique est d’annoter les frontières (paramètres, retours publics) et de laisser l’inférence à l’intérieur.
   :::

