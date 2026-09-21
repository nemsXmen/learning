---
id: typescript-10-narrowing-typeof
title: Narrowing avec typeof
slug: narrowing-typeof
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 1
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-08-narrowing-avec-les-unions]
skills: [type-narrowing]
tags: [typescript, narrowing, typeof]
---

## Objectifs

- Utiliser `typeof` pour narrow les types primitifs
- Connaître les valeurs retournées par `typeof`
- Pratiquer sur des unions courantes

## Introduction

`typeof` est le narrowing le plus simple pour les primitifs.

## Concept

```ts
function process(value: string | number | boolean) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value ? "yes" : "no";
}
```

Valeurs utiles de `typeof` : `"string"`, `"number"`, `"boolean"`, `"undefined"`, `"object"`, `"function"`, `"bigint"`, `"symbol"`.

Attention : `typeof null === "object"` (héritage JavaScript).

## Exemple

```ts
function padLeft(value: string | number) {
  if (typeof value === "number") {
    return " ".repeat(value);
  }
  return value;
}
```

## Comment ça fonctionne

TypeScript analyse le test `typeof x === "..."` et restreint le type de `x` dans la branche correspondante.

## Erreurs fréquentes

- Utiliser `typeof` sur des objets complexes (préférer `in` ou des type guards)
- Oublier le cas `null` (`typeof null === "object"`)

## À retenir

- `typeof` = narrowing des primitifs
- Très fiable pour string / number / boolean / function / undefined
- Attention à `null`

## Exercices

1. Écris une fonction qui accepte `string | number | boolean` et retourne une description textuelle selon le type.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function describe(value: string | number | boolean): string {
     if (typeof value === "string") return `string: ${value}`;
     if (typeof value === "number") return `number: ${value}`;
     return `boolean: ${value}`;
   }
   ```
   :::

## Questions d'entretien


1. Quand utilises-tu `typeof` pour le narrowing ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Principalement pour discriminer les types primitifs dans une union (string, number, boolean, function, undefined, bigint, symbol). Ce n’est pas adapté pour distinguer des formes d’objets.
   :::

