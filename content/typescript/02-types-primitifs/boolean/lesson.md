---
id: typescript-02-boolean
title: boolean
slug: boolean
technology: typescript
level: beginner
module: 02-types-primitifs
order: 3
estimatedMinutes: 12
difficulty: 1
xp: 35
prerequisites: [typescript-02-number]
skills: [primitive-types]
tags: [typescript, boolean, primitifs]
---

## Objectifs

- Maîtriser le type `boolean`
- Comprendre la différence avec les valeurs truthy/falsy
- Annoter correctement les booléens

## Introduction

`boolean` ne possède que deux valeurs : `true` et `false`.

## Concept

```ts
let isActive: boolean = true;
let hasPermission: boolean = false;
```

### Inférence

```ts
const isReady = true; // type inféré : boolean (ou même true en mode const)
```

### Attention aux truthy/falsy

JavaScript considère beaucoup de valeurs comme falsy (`0`, `""`, `null`, `undefined`, `NaN`…).  
TypeScript, lui, exige un vrai `boolean` quand le type est `boolean`.

```ts
function logStatus(isOnline: boolean) {
  console.log(isOnline ? "En ligne" : "Hors ligne");
}

// logStatus(1);        // ❌ Type 'number' is not assignable to type 'boolean'
// logStatus("");       // ❌
logStatus(true);        // OK
```

## Exemple

```ts
function canAccess(isLoggedIn: boolean, isAdmin: boolean): boolean {
  return isLoggedIn && isAdmin;
}
```

## Comment ça fonctionne

Le type `boolean` est strict. TypeScript ne fait pas de conversion automatique d’autres types vers `boolean` dans les annotations.

## Erreurs fréquentes

- Passer `0` ou `1` là où un `boolean` est attendu
- Utiliser `Boolean` (objet) au lieu de `boolean`
- Confondre le type `boolean` et le concept truthy/falsy de JavaScript

## À retenir

- Seulement `true` et `false`
- TypeScript est strict : pas de 0/1 à la place d’un boolean
- Préfère `boolean` à `Boolean`

## Exercices

1. Écris une fonction `isAdult(age: number): boolean` qui retourne true si age >= 18.

   :::solution
   ```ts
   function isAdult(age: number): boolean {
     return age >= 18;
   }
   ```
   :::

## Questions d'entretien

1. Peut-on passer `1` ou `0` à une fonction qui attend un `boolean` en TypeScript ?

   :::reponse
   Non. TypeScript refuse les types incompatibles. Contrairement à JavaScript où 1 est truthy, le type `boolean` n’accepte que `true` et `false`.
   :::
