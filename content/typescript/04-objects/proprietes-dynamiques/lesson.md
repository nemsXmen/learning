---
id: typescript-04-proprietes-dynamiques
title: Propriétés dynamiques
slug: proprietes-dynamiques
technology: typescript
level: beginner
module: 04-objects
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-04-index-signatures]
skills: [objects]
tags: [typescript, objects]
---

## Objectifs

- Accéder et assigner des propriétés via une variable (clé dynamique)
- Comprendre le lien avec les index signatures
- Éviter les pièges de typage

## Introduction

En JavaScript on écrit souvent `obj[key]`. TypeScript exige que le type de `key` et la forme de `obj` soient cohérents.

## Concept

```ts
type User = {
  name: string;
  age: number;
};

const user: User = { name: "Alice", age: 30 };
const key = "name";
const value = user[key]; // OK – key est "name" (literal) ou string compatible
```

Avec une clé vraiment dynamique :

```ts
function getProp(obj: User, key: keyof User) {
  return obj[key];
}
```

`keyof User` produit `"name" | "age"`.

## Exemple

```ts
type Dict = { [key: string]: number };
const scores: Dict = { alice: 10 };
const player = "alice";
scores[player] = 15; // OK grâce à l’index signature
```

## Comment ça fonctionne

Sans index signature, TypeScript n’autorise l’accès dynamique que si la clé est un literal ou un `keyof` compatible. Avec une index signature, l’accès devient plus large.

## Erreurs fréquentes

- Utiliser une `string` quelconque pour indexer un objet sans index signature
- Oublier `keyof` pour rester type-safe

## À retenir

- Préfère `keyof T` pour les accès dynamiques type-safe
- Les index signatures ouvrent la porte aux clés vraiment dynamiques
- Évite `obj[key]` avec `key: string` sur des objets à forme fixe

## Exercices

1. Écris une fonction qui prend un User et une clé `keyof User` et retourne la valeur.

   :::solution
   ```ts
   function getUserProp(user: User, key: keyof User) {
     return user[key];
   }
   ```
   :::

## Questions d'entretien

1. Comment accède-t-on de façon type-safe à une propriété via une variable ?

   :::reponse
   En typant la clé avec `keyof T` (ou un sous-ensemble de clés). Ainsi TypeScript sait quelles propriétés sont autorisées et quel type de valeur on obtient.
   :::
