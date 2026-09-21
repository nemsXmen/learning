---
id: typescript-08-types-intersection
title: Types intersection
slug: types-intersection
technology: typescript
level: beginner
module: 08-union-and-intersection
order: 4
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-08-unions-litterales]
skills: [unions-intersections]
tags: [typescript, intersections]
---

## Objectifs

- Comprendre l’intersection (`&`)
- Composer des types objets
- Voir les cas d’usage et les pièges

## Introduction

Une **intersection** combine plusieurs types en un seul qui possède les caractéristiques de tous.

## Concept

```ts
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;
// { name: string; age: number }

const p: Person = { name: "Alice", age: 30 };
```

## Exemple

```ts
type Timestamped = { createdAt: Date; updatedAt: Date };
type Entity = { id: string };
type User = Entity & Timestamped & { email: string };
```

## Comment ça fonctionne

Pour les objets, `&` fusionne les propriétés. Si deux propriétés ont des types incompatibles, le résultat pour cette propriété devient souvent `never`.

## Erreurs fréquentes

- Confondre `|` et `&`
- Créer des intersections conflictuelles

## À retenir

- `&` = et (combinaison)
- Très utile pour mixer des capacités / mixins de types
- Attention aux conflits de propriétés

## Exercices

1. Compose un type `Admin` à partir de `{ id: number; name: string }` et `{ role: "admin" }`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Admin = { id: number; name: string } & { role: "admin" };
   ```
   :::

## Questions d'entretien


1. Quelle est la différence entre union (`|`) et intersection (`&`) ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   L’union représente « l’un ou l’autre ». L’intersection représente « les deux à la fois » (toutes les propriétés combinées pour les objets).
   :::

