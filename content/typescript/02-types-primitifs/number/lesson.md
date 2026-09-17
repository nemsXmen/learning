---
id: typescript-02-number
title: number
slug: number
technology: typescript
level: beginner
module: 02-types-primitifs
order: 2
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-02-string]
skills: [primitive-types]
tags: [typescript, number, primitifs]
---

## Objectifs

- Maîtriser le type `number`
- Comprendre qu’il n’y a pas de distinction int/float
- Connaître les littéraux numériques supportés
- Éviter les pièges classiques (NaN, précision)

## Introduction

En TypeScript (comme en JavaScript), il n’existe qu’un seul type numérique primitif : `number`. Il représente aussi bien les entiers que les flottants (IEEE 754).

## Concept

```ts
let age: number = 30;
let price: number = 19.99;
let hex: number = 0xff;
let binary: number = 0b1010;
let octal: number = 0o744;
```

Tous ces littéraux sont de type `number`.

### Pas d’entier séparé

Contrairement à beaucoup de langages, TypeScript n’a pas de type `int` ou `float`. Tout est `number`.

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

### Valeurs spéciales

`number` inclut aussi :
- `NaN`
- `Infinity`
- `-Infinity`

TypeScript ne les distingue pas du type `number` par défaut.

## Exemple

```ts
function calculateTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

const total = calculateTotal(3, 12.5); // 37.5
// calculateTotal("3", 12.5); // ❌
```

## Comment ça fonctionne

TypeScript reprend le modèle numérique de JavaScript. Les opérations arithmétiques classiques (`+`, `-`, `*`, `/`, `%`, `**`) sont toutes typées pour retourner `number`.

La précision des flottants reste celle de JavaScript (attention à `0.1 + 0.2 !== 0.3`).

## Erreurs fréquentes

- Croire qu’il existe un type `int`
- Oublier que `NaN` est de type `number` (et que `typeof NaN === "number"`)
- Utiliser `Number` (objet) au lieu de `number`
- Faire des calculs monétaires avec `number` sans bibliothèque dédiée (précision)

## À retenir

- Un seul type numérique : `number`
- Entiers et flottants partagent le même type
- `NaN` et `Infinity` sont des `number`
- Préfère `number` à `Number`

## Exercices

1. Écris une fonction `average(a: number, b: number): number` qui retourne la moyenne.

   :::solution
   ```ts
   function average(a: number, b: number): number {
     return (a + b) / 2;
   }
   ```
   :::

2. Pourquoi `typeof NaN` vaut `"number"` et comment TypeScript le voit-il ?

   :::solution
   `NaN` est techniquement de type `number` en JavaScript et en TypeScript. Pour le détecter on utilise `Number.isNaN()`.
   :::

## Questions d'entretien

1. Existe-t-il un type entier distinct de `number` en TypeScript ?

   :::reponse
   Non. TypeScript (comme JavaScript) n’a qu’un type numérique primitif : `number`. Il représente les entiers et les flottants selon la norme IEEE 754. Pour des entiers plus grands on utilise `bigint`.
   :::
