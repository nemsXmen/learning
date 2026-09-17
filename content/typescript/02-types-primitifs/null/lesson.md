---
id: typescript-02-null
title: null
slug: null
technology: typescript
level: beginner
module: 02-types-primitifs
order: 4
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-02-boolean]
skills: [primitive-types]
tags: [typescript, null, primitifs]
---

## Objectifs

- Comprendre le type `null`
- Savoir comment il interagit avec `strictNullChecks`
- Utiliser `null` de façon intentionnelle et sûre

## Introduction

`null` représente l’absence intentionnelle de valeur. En TypeScript son comportement dépend fortement de l’option `strictNullChecks`.

## Concept

```ts
let value: null = null;
```

### Avec strictNullChecks (recommandé)

`null` n’est **pas** assignable aux autres types :

```ts
let name: string = null; // ❌ Type 'null' is not assignable to type 'string'
```

Pour accepter `null` il faut une union :

```ts
let name: string | null = null; // OK
name = "Alice";                 // OK
```

### Sans strictNullChecks (à éviter)

`null` devient assignable un peu partout, ce qui réduit fortement la sécurité.

## Exemple

```ts
function findUser(id: number): string | null {
  if (id === 1) return "Alice";
  return null; // utilisateur non trouvé
}

const user = findUser(2);
if (user !== null) {
  console.log(user.toUpperCase()); // safe
}
```

## Comment ça fonctionne

Quand `strictNullChecks` est activé, TypeScript traite `null` comme un type distinct. Tu dois explicitement indiquer qu’une valeur peut être `null` via une union (`T | null`).

C’est l’une des options les plus importantes de TypeScript pour éviter les fameux `Cannot read properties of null`.

## Erreurs fréquentes

- Laisser `strictNullChecks` désactivé
- Utiliser `null` et `undefined` de façon interchangeable sans réflexion
- Oublier de tester `!== null` avant d’utiliser la valeur

## À retenir

- `null` = absence intentionnelle de valeur
- Avec `strictNullChecks`, il faut `T | null`
- Toujours vérifier avant d’utiliser une valeur qui peut être `null`
- Préfère les unions explicites plutôt que de désactiver le mode strict

## Exercices

1. Écris une fonction `getLength(str: string | null): number` qui retourne 0 si null, sinon la longueur.

   :::solution
   ```ts
   function getLength(str: string | null): number {
     if (str === null) return 0;
     return str.length;
   }
   ```
   :::

## Questions d'entretien

1. Que change l’option `strictNullChecks` concernant `null` ?

   :::reponse
   Elle rend `null` non assignable aux autres types. On doit alors utiliser des unions (`string | null`) et faire des vérifications (narrowing) avant d’utiliser la valeur. C’est l’une des protections les plus importantes contre les erreurs runtime liées à null.
   :::
