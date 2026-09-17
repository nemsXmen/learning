---
id: typescript-02-unknown
title: unknown
slug: unknown
technology: typescript
level: beginner
module: 02-types-primitifs
order: 9
estimatedMinutes: 20
difficulty: 2
xp: 55
prerequisites: [typescript-02-any]
skills: [primitive-types, any-unknown-never]
tags: [typescript, unknown, primitifs]
---

## Objectifs

- Comprendre le type `unknown`
- Savoir pourquoi il est préférable à `any`
- Apprendre à faire du narrowing sur `unknown`
- L’utiliser aux frontières (API, JSON, user input)

## Introduction

`unknown` est la version sûre de `any`. Il signifie « je ne sais pas encore ce que c’est », mais TypeScript t’oblige à vérifier avant d’utiliser la valeur.

## Concept

```ts
let value: unknown = 42;
value = "hello";
value = { x: 1 };

// value.toFixed(); // ❌ Object is of type 'unknown'
```

Pour utiliser une valeur `unknown`, tu dois d’abord la *narrow* (réduire son type) :

```ts
if (typeof value === "string") {
  console.log(value.toUpperCase()); // OK ici
}
```

## Exemple

```ts
function processInput(input: unknown) {
  if (typeof input === "string") {
    return input.trim();
  }
  if (typeof input === "number") {
    return input.toFixed(2);
  }
  return "unsupported";
}
```

C’est particulièrement utile pour les données externes (JSON.parse, réponses d’API, etc.).

## Comment ça fonctionne

`unknown` est le type top sûr. Tout est assignable à `unknown`, mais `unknown` n’est assignable qu’à `unknown` et `any` (sans narrowing). Tu es forcé de prouver le type avant de l’utiliser.

## Erreurs fréquentes

- Utiliser `any` par habitude alors que `unknown` suffirait
- Faire un cast forcé (`as string`) sans vérification
- Oublier de gérer tous les cas dans le narrowing

## À retenir

- `unknown` = « je ne sais pas, et je dois vérifier »
- Préférable à `any` dans presque tous les cas
- Idéal aux frontières du système (données externes)
- Le narrowing (`typeof`, `instanceof`, type guards) est obligatoire

## Exercices

1. Écris une fonction qui accepte `unknown` et retourne la longueur si c’est une string, sinon 0.

   :::solution
   ```ts
   function getLength(value: unknown): number {
     if (typeof value === "string") return value.length;
     return 0;
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre `any` et `unknown` ?

   :::reponse
   `any` désactive le type-checking. `unknown` force à faire un narrowing avant d’utiliser la valeur. `unknown` est donc beaucoup plus sûr et devrait être préféré dès qu’on ne connaît pas le type exact d’une donnée.
   :::
