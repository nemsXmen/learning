---
id: typescript-02-undefined
title: undefined
slug: undefined
technology: typescript
level: beginner
module: 02-types-primitifs
order: 5
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-02-null]
skills: [primitive-types]
tags: [typescript, undefined, primitifs]
---

## Objectifs

- Comprendre le type `undefined`
- Distinguer `null` et `undefined`
- Savoir quand utiliser l’un ou l’autre
- Gérer les variables non initialisées

## Introduction

`undefined` signifie qu’une variable a été déclarée mais n’a pas encore de valeur, ou qu’une propriété/paramètre est absent.

## Concept

```ts
let value: undefined = undefined;
```

### Différence avec null

|             | null                          | undefined                          |
|-------------|-------------------------------|------------------------------------|
| Intention   | Absence volontaire de valeur  | Valeur non encore assignée / absente |
| Usage typique | Retour de fonction « pas trouvé » | Paramètre optionnel, variable non init |

### Avec strictNullChecks

```ts
let name: string = undefined; // ❌
let name: string | undefined = undefined; // OK
```

### Variables non initialisées

```ts
let x: number;
console.log(x); // ❌ Variable 'x' is used before being assigned
```

TypeScript t’empêche d’utiliser une variable avant de lui avoir donné une valeur.

## Exemple

```ts
function greet(name?: string) {
  // name est de type string | undefined
  if (name === undefined) {
    console.log("Hello, stranger");
  } else {
    console.log(`Hello, ${name}`);
  }
}
```

## Comment ça fonctionne

`undefined` est un type distinct sous `strictNullChecks`. Les paramètres optionnels (`name?: string`) sont automatiquement typés `string | undefined`.

## Erreurs fréquentes

- Traiter `null` et `undefined` comme strictement interchangeables
- Utiliser une variable avant initialisation
- Oublier le `?` pour les paramètres optionnels

## À retenir

- `undefined` = pas encore de valeur / absence
- `null` = absence intentionnelle
- Sous strictNullChecks les deux sont des types distincts
- Les paramètres optionnels sont `T | undefined`

## Exercices

1. Écris une fonction `getLabel(value?: string): string` qui retourne `"aucun"` si undefined, sinon la valeur.

   :::solution
   ```ts
   function getLabel(value?: string): string {
     if (value === undefined) return "aucun";
     return value;
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence conceptuelle entre `null` et `undefined` ?

   :::reponse
   `null` exprime une absence intentionnelle de valeur (souvent un retour de fonction). `undefined` signifie qu’une variable n’a pas encore été assignée ou qu’un paramètre/propriété est absent. En TypeScript strict les deux sont des types distincts.
   :::
