---
id: typescript-05-parametres-optionnels
title: Paramètres optionnels
slug: parametres-optionnels
technology: typescript
level: beginner
module: 05-functions
order: 3
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-05-typage-du-retour]
skills: [functions]
tags: [typescript, functions, optional]
---

## Objectifs

- Déclarer des paramètres optionnels avec `?`
- Comprendre qu’ils deviennent `T | undefined`
- Savoir les placer correctement (en fin de liste)

## Introduction

Les paramètres optionnels permettent d’appeler une fonction avec moins d’arguments.

## Concept

```ts
function greet(name: string, title?: string) {
  if (title) {
    console.log(`Hello ${title} ${name}`);
  } else {
    console.log(`Hello ${name}`);
  }
}

greet("Alice");
greet("Alice", "Dr");
```

Le paramètre `title` a le type `string | undefined`.

Les paramètres optionnels doivent être **après** les paramètres obligatoires.

## Exemple

```ts
function createUser(name: string, age?: number) {
  return { name, age: age ?? null };
}
```

## Comment ça fonctionne

`param?: Type` est équivalent à `param: Type | undefined` avec la possibilité d’omettre l’argument à l’appel.

## Erreurs fréquentes

- Placer un paramètre optionnel avant un paramètre obligatoire
- Accéder à la valeur sans vérifier `undefined`

## À retenir

- Syntaxe : `name?: Type`
- Toujours en fin de liste (avant les rest éventuels)
- Pense à gérer le cas `undefined`

## Exercices

1. Écris une fonction `log` qui prend un message obligatoire et un niveau optionnel.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function log(message: string, level?: string) {
     console.log(level ? `[${level}] ${message}` : message);
   }
   ```
   :::

## Questions d'entretien


1. Peut-on avoir un paramètre obligatoire après un paramètre optionnel ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Non. Les paramètres optionnels doivent être placés après les paramètres obligatoires.
   :::

