---
id: typescript-04-destructuration-objets
title: Destructuration d’objets
slug: destructuration-objets
technology: typescript
level: beginner
module: 04-objects
order: 8
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-04-proprietes-dynamiques]
skills: [objects]
tags: [typescript, objects, destructuring]
---

## Objectifs

- Destructurer un objet en conservant les types
- Utiliser les valeurs par défaut et le renommage
- Voir la destructuration dans les paramètres de fonction

## Introduction

La destructuration d’objets est très utilisée et parfaitement typée en TypeScript.

## Concept

```ts
type User = { name: string; age: number };

const user: User = { name: "Alice", age: 30 };
const { name, age } = user;
// name: string, age: number
```

Avec renommage et valeur par défaut :

```ts
const { name: userName, age = 0 } = user;
```

Dans les paramètres :

```ts
function print({ name, age }: User) {
  console.log(name, age);
}
```

## Exemple

```ts
function getDisplayName({ name, nickname = name }: { name: string; nickname?: string }) {
  return nickname;
}
```

## Comment ça fonctionne

TypeScript propage le type de chaque propriété vers la variable correspondante. Les valeurs par défaut et le renommage sont supportés.

## Erreurs fréquentes

- Destructurer une propriété optionnelle sans gérer `undefined`
- Oublier d’annoter le paramètre destructuré

## À retenir

- La destructuration conserve les types
- Très pratique dans les signatures de fonctions
- Compatible avec optionnels et valeurs par défaut

## Exercices

1. Destructure `name` et `age` d’un objet User dans une fonction.

   :::solution
   ```ts
   function show({ name, age }: User) {
     console.log(name, age);
   }
   ```
   :::

## Questions d'entretien

1. Les types sont-ils conservés lors de la destructuration d’un objet ?

   :::reponse
   Oui. Chaque variable reçoit le type de la propriété correspondante.
   :::
