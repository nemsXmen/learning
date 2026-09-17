---
id: typescript-04-proprietes-optionnelles
title: Propriétés optionnelles
slug: proprietes-optionnelles
technology: typescript
level: beginner
module: 04-objects
order: 3
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-04-proprietes-obligatoires]
skills: [objects]
tags: [typescript, objects, optional]
---

## Objectifs

- Déclarer des propriétés optionnelles avec `?`
- Comprendre le type résultant (`T | undefined`)
- Savoir accéder proprement à une propriété optionnelle

## Introduction

Beaucoup d’objets ont des champs qui ne sont pas toujours présents. TypeScript le modélise avec `?`.

## Concept

```ts
type User = {
  id: number;
  name: string;
  email?: string; // optionnel
};

const u1: User = { id: 1, name: "Alice" };
const u2: User = { id: 2, name: "Bob", email: "bob@example.com" };
```

Le type de `email` est `string | undefined`.

## Exemple

```ts
function getEmail(user: User): string {
  return user.email ?? "non renseigné";
}
```

## Comment ça fonctionne

`prop?: Type` est équivalent à `prop: Type | undefined` avec la possibilité d’omettre la propriété à l’écriture.

## Erreurs fréquentes

- Accéder à `user.email.toLowerCase()` sans vérifier
- Confondre propriété optionnelle et propriété `T | null`

## À retenir

- `prop?: Type` → propriété omise ou de type Type | undefined
- Toujours narrowing ou optional chaining avant utilisation
- Très courant dans les APIs et les formulaires

## Exercices

1. Ajoute une propriété optionnelle `nickname` à un type User.

   :::solution
   ```ts
   type User = {
     id: number;
     name: string;
     nickname?: string;
   };
   ```
   :::

## Questions d'entretien

1. Quel est le type réel d’une propriété `email?: string` ?

   :::reponse
   `string | undefined`. La propriété peut être absente ou contenir une string (ou explicitement undefined).
   :::
