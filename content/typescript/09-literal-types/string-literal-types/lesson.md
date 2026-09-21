---
id: typescript-09-string-literal-types
title: String literal types
slug: string-literal-types
technology: typescript
level: beginner
module: 09-literal-types
order: 1
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-08-unions-litterales]
skills: [literal-types]
tags: [typescript, literals, string]
---

## Objectifs

- Comprendre les string literal types
- Les déclarer et les utiliser
- Voir la différence avec `string`

## Introduction

Un **string literal type** n’accepte qu’une seule valeur string précise.

## Concept

```ts
type Direction = "north";
let dir: Direction = "north";
// dir = "south"; // ❌ Type '"south"' is not assignable to type '"north"'
```

Plus utile en union :

```ts
type Alignment = "left" | "center" | "right";
```

## Exemple

```ts
function setAlignment(value: "left" | "center" | "right") {
  // ...
}
setAlignment("center"); // OK
// setAlignment("middle"); // ❌
```

## Comment ça fonctionne

Chaque littéral string est un type distinct, sous-type de `string`. TypeScript les utilise pour le narrowing et l’autocomplétion.

## Erreurs fréquentes

- Annoter en `string` alors qu’une literal union suffirait
- Confondre la valeur runtime et le type

## À retenir

- `"hello"` est un type aussi bien qu’une valeur
- Idéal pour les ensembles fermés de chaînes
- Base des literal unions

## Exercices

1. Crée un type `Theme` pour `"light" | "dark"`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Theme = "light" | "dark";
   ```
   :::

## Questions d'entretien


1. Quelle est la différence entre le type `string` et le type `"hello"` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   `string` accepte n’importe quelle chaîne. `"hello"` n’accepte que la valeur exacte `"hello"`. Les string literal types permettent de restreindre les valeurs possibles.
   :::

