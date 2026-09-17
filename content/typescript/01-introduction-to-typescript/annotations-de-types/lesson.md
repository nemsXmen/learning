---
id: typescript-01-annotations-de-types
title: Annotations de types
slug: annotations-de-types
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 12
estimatedMinutes: 20
difficulty: 1
xp: 50
prerequisites: [typescript-01-inference-de-types]
skills: [typescript-basics]
tags: [typescript, annotations, types]
---

## Objectifs

- Savoir écrire des annotations de types
- Annoter variables, paramètres et retours de fonctions
- Comprendre quand l’annotation est obligatoire ou utile

## Introduction

Les annotations sont la façon explicite de dire à TypeScript « cette chose est de tel type ».

## Concept

Syntaxe de base :

```ts
let age: number = 30;
let name: string = "Alice";
let isActive: boolean = true;

function greet(person: string): string {
  return "Hello, " + person;
}
```

On peut aussi annoter sans initialiser (mais c’est plus rare et parfois dangereux) :

```ts
let score: number;
score = 100;
```

### Annotations les plus courantes

- Variables : `let x: Type = value`
- Paramètres : `function f(param: Type)`
- Retour : `function f(): Type`
- Propriétés d’objet / interface
- Tableaux : `number[]` ou `Array<number>`

## Exemple

```ts
function createUser(name: string, age: number): { name: string; age: number } {
  return { name, age };
}

const user = createUser("Bob", 25);
```

Ou plus proprement avec une interface (vu plus tard) :

```ts
interface User {
  name: string;
  age: number;
}

function createUser(name: string, age: number): User {
  return { name, age };
}
```

## Comment ça fonctionne

L’annotation force TypeScript à vérifier que la valeur assignée ou retournée est compatible avec le type déclaré. Si ce n’est pas le cas, erreur de compilation.

## Erreurs fréquentes

- Annoter et initialiser avec un type incompatible  
  ```ts
  let n: number = "42"; // ❌
  ```

- Oublier le retour annoté alors qu’on retourne `undefined` implicitement

- Sur-annoter les variables locales évidentes

## À retenir

- Annotation = contrat explicite
- Utile surtout aux frontières (API, paramètres, retours)
- L’inférence suffit souvent à l’intérieur
- La syntaxe est `: Type` après le nom

## Exercices

1. Annoter correctement cette fonction :

```ts
function multiply(a, b) {
  return a * b;
}
```

   :::solution
   ```ts
   function multiply(a: number, b: number): number {
     return a * b;
   }
   ```
   :::

## Questions d'entretien

1. Quand dois-tu annoter explicitement un type plutôt que de laisser l’inférence ?

   :::reponse
   Principalement aux frontières : paramètres de fonctions, valeurs de retour publiques, variables non initialisées, et partout où l’inférence produirait un type trop large (any) ou imprécis. À l’intérieur des fonctions, l’inférence est généralement préférable.
   :::
