---
id: typescript-02-string
title: string
slug: string
technology: typescript
level: beginner
module: 02-types-primitifs
order: 1
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-01-annotations-de-types]
skills: [primitive-types]
tags: [typescript, string, primitifs]
---

## Objectifs

- Maîtriser le type `string` en TypeScript
- Connaître les façons de créer des chaînes
- Comprendre l’inférence et les annotations liées aux strings
- Savoir utiliser les template literals de façon typée

## Introduction

`string` est l’un des types primitifs les plus utilisés. TypeScript le traite avec le même sérieux que les autres types primitifs.

## Concept

Le type `string` représente toutes les valeurs textuelles JavaScript.

```ts
let firstName: string = "Alice";
let lastName: string = 'Dupont';
let fullName: string = `Bonjour ${firstName}`;
```

TypeScript accepte les trois syntaxes de chaînes JavaScript :
- Guillemets doubles `"..."`
- Guillemets simples `'...'`
- Template literals `` `...` ``

### Inférence

```ts
const message = "Hello"; // type inféré : string
```

### String vs String (objet)

Évite l’objet wrapper `String` :

```ts
let a: string = "hello";     // OK – primitif
let b: String = new String("hello"); // à éviter
```

Préfère toujours le type primitif `string`.

## Exemple

```ts
function greet(name: string): string {
  return `Hello, ${name.toUpperCase()}!`;
}

console.log(greet("alice")); // Hello, ALICE!
// greet(42); // ❌ Argument of type 'number' is not assignable to parameter of type 'string'
```

Les méthodes de `string` (`toUpperCase`, `slice`, `includes`…) sont toutes correctement typées.

## Comment ça fonctionne

TypeScript s’appuie sur les définitions de la librairie standard (`lib.es5.d.ts`, etc.). Dès que tu déclares une variable `string`, l’éditeur te propose toutes les méthodes disponibles avec leurs signatures exactes.

Les template literals restent des `string` classiques sauf si tu utilises les **template literal types** (niveau plus avancé).

## Erreurs fréquentes

- Utiliser `String` (objet) au lieu de `string` (primitif)
- Oublier que `null` et `undefined` ne sont pas assignables à `string` en mode `strictNullChecks`
- Confondre `string` et les string literal types (`"admin" | "user"`)

## À retenir

- `string` = type primitif pour les chaînes de caractères
- Préfère toujours `string` à `String`
- Les template literals sont parfaitement supportés
- En mode strict, `null` et `undefined` ne sont pas des `string`

## Exercices

1. Écris une fonction `formatPrice(price: number, currency: string): string` qui retourne une chaîne du type `"12.50 EUR"`.

   :::indice
   Utilise un template literal et `toFixed(2)`.
   :::

   :::solution
   ```ts
   function formatPrice(price: number, currency: string): string {
     return `${price.toFixed(2)} ${currency}`;
   }
   ```
   :::

2. Pourquoi ce code est-il refusé en mode strict ?

```ts
let name: string = null;
```

   :::indice
   Regarde l’option `strictNullChecks`.
   :::

   :::solution
   Avec `strictNullChecks`, `null` n’est pas assignable à `string`. Il faudrait `string | null` ou une autre approche.
   :::

## Questions d'entretien

1. Quelle est la différence entre `string` et `String` en TypeScript ?

   :::indice
   Primitif vs objet wrapper.
   :::

   :::reponse
   `string` est le type primitif. `String` est le type de l’objet wrapper `new String(...)`. On utilise presque toujours le primitif `string`. L’objet `String` est rarement pertinent et peut créer des confusions.
   :::

2. Comment TypeScript gère-t-il les template literals ?

   :::reponse
   Un template literal classique est inféré comme `string`. TypeScript propose aussi les *template literal types* (ex. `` `hello-${string}` ``) qui permettent de manipuler les chaînes au niveau des types, mais c’est un sujet plus avancé.
   :::
