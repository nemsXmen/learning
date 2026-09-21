---
id: typescript-03-destructuration-de-tuples
title: Destructuration de tuples
slug: destructuration-de-tuples
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 11
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-03-elements-rest-tuples]
skills: [arrays-tuples]
tags: [typescript, tuples, destructuring]
---

## Objectifs

- Destructurer un tuple en variables typées
- Utiliser le rest dans la destructuration
- Voir les cas pratiques

## Introduction

La destructuration fonctionne parfaitement avec les tuples et conserve les types de chaque position.

## Concept

```ts
const person: [string, number] = ["Alice", 30];
const [name, age] = person;
// name: string, age: number
```

Avec rest :

```ts
const entry: [string, ...number[]] = ["scores", 10, 20, 30];
const [label, ...scores] = entry;
// label: string, scores: number[]
```

## Exemple

```ts
function getCoordinates(): [number, number] {
  return [10, 20];
}

const [x, y] = getCoordinates();
```

## Comment ça fonctionne

TypeScript propage le type de chaque position du tuple vers la variable correspondante de la destructuration.

## Erreurs fréquentes

- Destructurer plus d’éléments qu’il n’y en a (ou oublier les optionnels)
- Ignorer que les variables restent liées aux types du tuple

## À retenir

- La destructuration conserve les types positionnels
- Très lisible pour les retours de fonctions
- Compatible avec rest et éléments optionnels

## Exercices

1. Destructure un tuple `[string, number, boolean]` en trois variables.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   const data: [string, number, boolean] = ["ok", 200, true];
   const [message, code, success] = data;
   ```
   :::

## Questions d'entretien


1. Les types sont-ils conservés lors de la destructuration d’un tuple ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Oui. Chaque variable reçoit le type de la position correspondante du tuple.
   :::

