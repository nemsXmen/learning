---
id: typescript-04-proprietes-obligatoires
title: Propriétés obligatoires
slug: proprietes-obligatoires
technology: typescript
level: beginner
module: 04-objects
order: 2
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-04-typage-des-objets]
skills: [objects]
tags: [typescript, objects]
---

## Objectifs

- Comprendre qu’une propriété sans `?` est obligatoire
- Voir les erreurs liées aux propriétés manquantes
- Savoir quand rendre une propriété obligatoire

## Introduction

Par défaut, toutes les propriétés déclarées dans un type objet sont **obligatoires**.

## Concept

```ts
type User = {
  id: number;
  name: string;
};

const u: User = { id: 1, name: "Alice" }; // OK
// const bad: User = { id: 1 }; // ❌ Property 'name' is missing
```

## Exemple

```ts
function createUser(id: number, name: string): { id: number; name: string } {
  return { id, name };
}
```

## Comment ça fonctionne

TypeScript exige la présence de chaque propriété non optionnelle lors de l’assignation d’un objet littéral ou d’une variable du type concerné.

## Erreurs fréquentes

- Oublier une propriété lors de la création
- Croire qu’une propriété absente vaut automatiquement `undefined` sans l’avoir déclarée optionnelle

## À retenir

- Pas de `?` = propriété obligatoire
- Toutes les propriétés obligatoires doivent être fournies
- C’est le comportement par défaut et le plus sûr

## Exercices

1. Crée un type `Book` avec `title` et `pages` obligatoires.

   :::solution
   ```ts
   type Book = {
     title: string;
     pages: number;
   };
   ```
   :::

## Questions d'entretien

1. Que se passe-t-il si une propriété obligatoire est absente ?

   :::reponse
   TypeScript émet une erreur de compilation indiquant que la propriété est manquante.
   :::
