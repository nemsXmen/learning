---
id: typescript-03-tableaux-multidimensionnels
title: Tableaux multidimensionnels
slug: tableaux-multidimensionnels
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-03-tableaux-complexes]
skills: [arrays-tuples]
tags: [typescript, arrays, matrice]
---

## Objectifs

- Typer des tableaux à plusieurs dimensions
- Comprendre la syntaxe `T[][]`
- Voir un cas d’usage simple (matrice)

## Introduction

Un tableau de tableaux se type naturellement en empilant les `[]`.

## Concept

```ts
const matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

const value = matrix[1][2]; // 6 – type number
```

On peut aussi écrire `Array<Array<number>>`.

## Exemple

```ts
function sumMatrix(m: number[][]): number {
  return m.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
}
```

## Comment ça fonctionne

Chaque niveau de `[]` ajoute une dimension. TypeScript suit les accès par index et propage le type correctement.

## Erreurs fréquentes

- Accéder à un index sans vérifier la longueur (runtime)
- Confondre `number[][]` et `(number[])[]` (identique) avec d’autres parenthésages

## À retenir

- `T[][]` = tableau de tableaux de T
- Fonctionne pour n’importe quel nombre de dimensions
- L’accès `matrix[i][j]` est typé

## Exercices

1. Déclare une grille 2×2 de booléens.

   :::solution
   ```ts
   const grid: boolean[][] = [
     [true, false],
     [false, true]
   ];
   ```
   :::

## Questions d'entretien

1. Comment type-t-on une matrice de nombres en TypeScript ?

   :::reponse
   `number[][]` ou `Array<Array<number>>`. Chaque élément du tableau externe est lui-même un tableau de numbers.
   :::
