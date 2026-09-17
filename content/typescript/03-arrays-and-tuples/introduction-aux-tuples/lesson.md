---
id: typescript-03-introduction-aux-tuples
title: Introduction aux tuples
slug: introduction-aux-tuples
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 7
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-03-tableaux-readonly]
skills: [arrays-tuples]
tags: [typescript, tuples]
---

## Objectifs

- Comprendre ce qu’est un tuple en TypeScript
- Savoir le déclarer et l’utiliser
- Distinguer tuple et tableau classique

## Introduction

Un **tuple** est un tableau de longueur fixe dont chaque position a un type précis (potentiellement différent).

## Concept

```ts
let person: [string, number] = ["Alice", 30];
// person[0] → string
// person[1] → number
```

On ne peut pas inverser les types :

```ts
// person = [30, "Alice"]; // ❌
```

La longueur est aussi contrôlée (dans la plupart des cas) :

```ts
// person = ["Alice", 30, true]; // ❌
```

## Exemple

```ts
function getUser(): [string, number] {
  return ["Bob", 25];
}

const [name, age] = getUser();
```

## Comment ça fonctionne

TypeScript traite les tuples comme des tableaux avec des types positionnels. L’accès par index littéral (`person[0]`) donne le type exact de cette position.

## Erreurs fréquentes

- Utiliser un tuple alors qu’un objet nommé serait plus clair
- Oublier que les tuples restent des tableaux à runtime (on peut parfois les muter selon la config)

## À retenir

- Tuple = longueur fixe + types par position
- Syntaxe : `[Type1, Type2, ...]`
- Très utile pour les retours multiples et les coordonnées

## Exercices

1. Déclare un tuple représentant une coordonnée (x: number, y: number).

   :::solution
   ```ts
   const point: [number, number] = [10, 20];
   ```
   :::

## Questions d'entretien

1. Quelle est la différence principale entre un tuple et un tableau classique ?

   :::reponse
   Un tableau classique a un type d’élément unique et une longueur variable. Un tuple a une longueur fixe et un type potentiellement différent à chaque position.
   :::
