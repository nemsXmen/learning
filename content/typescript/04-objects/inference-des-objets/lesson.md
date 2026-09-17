---
id: typescript-04-inference-des-objets
title: Inférence des objets
slug: inference-des-objets
technology: typescript
level: beginner
module: 04-objects
order: 11
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-04-structural-typing]
skills: [objects]
tags: [typescript, objects, inference]
---

## Objectifs

- Voir comment TypeScript infère le type des objets littéraux
- Comprendre l’effet de `const` et `as const`
- Savoir quand annoter explicitement

## Introduction

TypeScript infère la forme des objets à partir de leurs propriétés.

## Concept

```ts
const user = {
  name: "Alice",
  age: 30
};
// type inféré : { name: string; age: number }
```

Avec `as const` :

```ts
const user = {
  name: "Alice",
  age: 30
} as const;
// type : { readonly name: "Alice"; readonly age: 30 }
```

Les littéraux deviennent des literal types et les propriétés deviennent readonly.

## Exemple

```ts
const config = {
  host: "localhost",
  port: 3000
} as const;

// config.port = 4000; // ❌ readonly
```

## Comment ça fonctionne

Sans annotation, TypeScript élargit les littéraux (`"Alice"` → `string`). `as const` demande l’inférence la plus précise possible.

## Erreurs fréquentes

- Oublier `as const` quand on veut des literal types
- Sur-annoter des objets dont l’inférence est déjà claire

## À retenir

- L’inférence d’objets est fiable
- `as const` donne des literal types + readonly
- Annoter quand on veut un contrat nommé ou plus large/plus strict

## Exercices

1. Quel est le type inféré de `const p = { x: 1, y: 2 }` ?

   :::solution
   `{ x: number; y: number }`
   :::

## Questions d'entretien

1. À quoi sert `as const` sur un objet littéral ?

   :::reponse
   Il demande l’inférence la plus étroite possible : les propriétés deviennent readonly et les valeurs littérales gardent leur type littéral exact au lieu d’être élargies (string, number…).
   :::
