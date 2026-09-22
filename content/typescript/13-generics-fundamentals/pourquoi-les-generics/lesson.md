---
id: typescript-13-pourquoi-les-generics
title: Pourquoi les generics ?
slug: pourquoi-les-generics
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 1
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-05-function-types]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Comprendre le problème que résolvent les generics
- Voir les limites du typage sans generics
- Introduire l’idée de paramètres de type

## Introduction

Les **generics** permettent d’écrire du code réutilisable tout en conservant un typage précis.

## Concept

Sans generics, on tombe souvent sur :

```ts
function identity(value: any): any {
  return value;
}
const n = identity(42); // any → plus de type
```

Ou on duplique :

```ts
function identityNumber(value: number): number { return value; }
function identityString(value: string): string { return value; }
```

Avec un generic :

```ts
function identity<T>(value: T): T {
  return value;
}
const n = identity(42);      // number
const s = identity("hello"); // string
```

## Exemple

Les generics capturent la relation entre entrées et sorties sans perdre l’information de type.

## Comment ça fonctionne

`T` est un **paramètre de type**. Il est fixé à l’appel (par inférence ou explicitement) et propage le type à travers la signature.

## Erreurs fréquentes

- Utiliser `any` faute de connaître les generics
- Dupliquer des fonctions quasi identiques pour chaque type

## À retenir

- Generics = réutilisation + précision de type
- Évitent `any` et la duplication
- Fondamentaux de TypeScript moderne

## Exercices

1. Écris une fonction `identity` générique et appelle-la avec un number et un string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function identity<T>(value: T): T {
     return value;
   }
   identity(1);
   identity("a");
   ```
   :::

## Questions d'entretien

1. Quel problème les generics résolvent-ils ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Ils permettent d’écrire des fonctions et des types réutilisables tout en préservant les types concrets des valeurs (relation entrée/sortie), sans recourir à `any` ni à la duplication.
   :::
