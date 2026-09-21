---
id: typescript-03-elements-rest-tuples
title: Éléments rest dans les tuples
slug: elements-rest-tuples
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-03-elements-optionnels-tuples]
skills: [arrays-tuples]
tags: [typescript, tuples, rest]
---

## Objectifs

- Utiliser les éléments rest (`...T[]`) dans les tuples
- Typer des tuples de longueur variable à partir d’une position
- Voir un cas d’usage courant

## Introduction

Le rest element permet de dire « à partir d’ici, un nombre variable d’éléments de tel type ».

## Concept

```ts
type StringNumberBooleans = [string, number, ...boolean[]];

const a: StringNumberBooleans = ["hello", 42];
const b: StringNumberBooleans = ["hello", 42, true, false];
```

Le rest doit être le **dernier** élément du tuple.

## Exemple

```ts
function logPair(pair: [string, ...number[]]) {
  const [label, ...values] = pair;
  console.log(label, values);
}
```

## Comment ça fonctionne

`...T[]` (ou `...Array<T>`) capture zéro ou plusieurs éléments de type T à la fin du tuple.

## Erreurs fréquentes

- Mettre le rest ailleurs qu’à la fin
- Confondre avec les rest parameters de fonctions (même idée, contexte différent)

## À retenir

- Syntaxe : `[Type1, ...Type2[]]`
- Toujours en dernière position
- Utile pour les listes hétérogènes avec une tête fixe

## Exercices

1. Déclare un tuple qui commence par un string suivi d’un nombre quelconque de numbers.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type HeadAndNumbers = [string, ...number[]];
   const data: HeadAndNumbers = ["scores", 10, 20, 30];
   ```
   :::

## Questions d'entretien


1. Où doit se trouver l’élément rest dans un tuple ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Toujours en dernière position. TypeScript n’autorise pas de rest au milieu ou au début d’un tuple (sauf cas très avancés avec des variadic tuples).
   :::

