---
id: typescript-03-tableaux-types
title: Tableaux typés
slug: tableaux-types
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 1
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-02-string]
skills: [arrays-tuples]
tags: [typescript, arrays, tableaux]
---

## Objectifs

- Comprendre comment typer un tableau en TypeScript
- Connaître les deux syntaxes principales
- Savoir ce que TypeScript vérifie sur les tableaux

## Introduction

Les tableaux sont omniprésents. TypeScript permet de préciser le type des éléments qu’ils contiennent, ce qui évite beaucoup d’erreurs.

## Concept

Un tableau typé ne peut contenir que des éléments d’un (ou plusieurs) type(s) donné(s).

```ts
let scores: number[] = [10, 20, 30];
scores.push(40);     // OK
// scores.push("50"); // ❌ Argument of type 'string' is not assignable to parameter of type 'number'
```

TypeScript vérifie :
- Les éléments ajoutés (`push`, `unshift`…)
- Les éléments assignés par index
- Le résultat des méthodes (`map`, `filter`…)

## Exemple

```ts
const names: string[] = ["Alice", "Bob"];
const lengths = names.map(n => n.length); // number[]
```

## Comment ça fonctionne

Le type `T[]` signifie « tableau dont chaque élément est de type T ». TypeScript propage ce type à travers les méthodes du prototype Array.

## Erreurs fréquentes

- Oublier d’annoter et se retrouver avec `any[]`
- Mélanger des types incompatibles sans union
- Croire que le type du tableau change après un `push` d’un autre type (il refuse)

## À retenir

- `T[]` = tableau d’éléments de type T
- TypeScript vérifie les ajouts et les lectures
- L’inférence fonctionne très bien dès qu’il y a une valeur initiale

## Exercices

1. Déclare un tableau de booléens et ajoute deux valeurs.

   :::solution
   ```ts
   const flags: boolean[] = [true, false];
   flags.push(true);
   ```
   :::

## Questions d'entretien

1. Que vérifie TypeScript sur un tableau typé `number[]` ?

   :::reponse
   Il s’assure que tous les éléments ajoutés ou assignés sont bien des `number`. Les méthodes comme `map` et `filter` propagent aussi le type correctement.
   :::
