---
id: typescript-03-elements-optionnels-tuples
title: Éléments optionnels dans les tuples
slug: elements-optionnels-tuples
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-03-tuples-nommes]
skills: [arrays-tuples]
tags: [typescript, tuples, optional]
---

## Objectifs

- Déclarer des éléments optionnels dans un tuple
- Comprendre l’impact sur la longueur
- Savoir quand les utiliser

## Introduction

On peut marquer certaines positions d’un tuple comme optionnelles avec `?`.

## Concept

```ts
type OptionalSecond = [string, number?];

const a: OptionalSecond = ["hello"];
const b: OptionalSecond = ["hello", 42];
```

Les éléments optionnels doivent être **à la fin** du tuple (ou suivis uniquement d’autres optionnels / rest).

## Exemple

```ts
function createRange(start: number, end?: number): [number, number?] {
  return end === undefined ? [start] : [start, end];
}
```

## Comment ça fonctionne

Un élément optionnel ajoute `| undefined` à son type et rend la longueur variable dans les limites autorisées.

## Erreurs fréquentes

- Mettre un élément optionnel au milieu puis un élément obligatoire après
- Oublier que la valeur peut être `undefined`

## À retenir

- Syntaxe : `[Type1, Type2?]`
- Les optionnels se placent en fin de tuple
- Utile pour les retours ou arguments partiellement présents

## Exercices

1. Déclare un tuple `[id: number, name?: string]`.

   :::solution
   ```ts
   type UserTuple = [id: number, name?: string];
   const u1: UserTuple = [1];
   const u2: UserTuple = [1, "Alice"];
   ```
   :::

## Questions d'entretien

1. Peut-on avoir un élément obligatoire après un élément optionnel dans un tuple ?

   :::reponse
   Non. Les éléments optionnels doivent être regroupés à la fin (avant un éventuel élément rest).
   :::
