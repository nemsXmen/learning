---
id: typescript-04-excess-property-checking
title: Excess property checking
slug: excess-property-checking
technology: typescript
level: beginner
module: 04-objects
order: 9
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-04-destructuration-objets]
skills: [objects]
tags: [typescript, objects]
---

## Objectifs

- Comprendre le excess property checking
- Savoir quand TypeScript signale des propriétés en trop
- Connaître les contournements intentionnels

## Introduction

Quand on assigne un **objet littéral** à un type, TypeScript est strict : toute propriété non déclarée dans le type est une erreur.

## Concept

```ts
type User = { name: string };

const u: User = {
  name: "Alice",
  age: 30 // ❌ Object literal may only specify known properties
};
```

Ce contrôle ne s’applique qu’aux objets littéraux frais, pas aux variables déjà typées :

```ts
const obj = { name: "Alice", age: 30 };
const u: User = obj; // OK (structural typing)
```

## Exemple

```ts
interface Options {
  verbose?: boolean;
}

function configure(options: Options) { /* ... */ }

configure({ verbose: true });
// configure({ verbose: true, debug: true }); // ❌ excess property
```

## Comment ça fonctionne

C’est une protection contre les fautes de frappe et les propriétés oubliées dans le type. TypeScript considère qu’un littéral « frais » doit coller exactement au type cible.

## Erreurs fréquentes

- Ne pas comprendre pourquoi une variable intermédiaire fait disparaître l’erreur
- Utiliser un cast pour faire taire l’erreur au lieu de corriger le type

## À retenir

- Les objets littéraux sont soumis au excess property checking
- Les variables déjà typées suivent le typage structurel classique
- C’est une aide, pas un bug

## Exercices

1. Pourquoi ce code échoue-t-il et comment le faire passer intentionnellement ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

```ts
type Point = { x: number };
const p: Point = { x: 1, y: 2 };
```

   :::solution
   Excess property checking sur le littéral. Solutions : enlever y, étendre le type, ou passer par une variable intermédiaire.
   :::

## Questions d'entretien


1. Qu’est-ce que le excess property checking ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   C’est une vérification supplémentaire de TypeScript qui refuse les propriétés inconnues sur les objets littéraux assignés à un type. Elle ne s’applique pas de la même façon aux variables déjà typées (typage structurel classique).
   :::

