---
id: typescript-02-inference-des-types-primitifs
title: Inférence des types primitifs
slug: inference-des-types-primitifs
technology: typescript
level: beginner
module: 02-types-primitifs
order: 12
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-02-void]
skills: [primitive-types]
tags: [typescript, inference, primitifs]
---

## Objectifs

- Revoir l’inférence appliquée aux types primitifs
- Voir les cas où l’inférence est précise (literal types)
- Savoir quand elle produit un type trop large

## Introduction

TypeScript infère très bien les types primitifs à partir des littéraux.

## Concept

```ts
const name = "Alice";     // type: "Alice" (string literal) avec const
let name2 = "Alice";      // type: string

const age = 30;           // type: 30
let age2 = 30;            // type: number

const ok = true;          // type: true
let ok2 = true;           // type: boolean
```

Avec `const`, TypeScript infère le **literal type** le plus précis.  
Avec `let`, il élargit au type primitif de base (`string`, `number`, `boolean`).

## Exemple

```ts
const status = "success"; // "success"
// status = "error";     // ❌ Type '"error"' is not assignable to type '"success"'
```

## Comment ça fonctionne

L’inférence dépend de la mutabilité (`let` vs `const`) et du contexte. Les littéraux `const` deviennent des literal types, ce qui est très utile pour les configurations et les unions discriminées.

## Erreurs fréquentes

- S’étonner que `let x = "hello"` soit `string` et non `"hello"`
- Forcer des annotations inutiles sur des variables évidentes

## À retenir

- `const` → literal type précis
- `let` → type primitif élargi
- L’inférence des primitifs est fiable et devrait être laissée faire dans la majorité des cas

## Exercices

1. Quel type est inféré pour `const role = "admin";` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   Le literal type `"admin"`.
   :::

## Questions d'entretien


1. Pourquoi `const x = "hello"` a-t-il un type plus précis que `let x = "hello"` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Parce que `const` ne peut pas être réassigné. TypeScript peut donc inférer le literal type exact `"hello"`. Avec `let`, la variable peut recevoir n’importe quelle string, donc le type est élargi à `string`.
   :::

