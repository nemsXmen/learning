---
id: typescript-06-composition-de-types
title: Composition de types
slug: composition-de-types
technology: typescript
level: beginner
module: 06-type-aliases
order: 9
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-06-types-recursifs]
skills: [type-aliases]
tags: [typescript, type-aliases, composition]
---

## Objectifs

- Composer des types avec union (`|`) et intersection (`&`)
- Utiliser les type aliases comme briques de construction
- Voir des patterns de composition courants

## Introduction

La composition est au cœur de la modélisation TypeScript : on combine des types simples pour en créer de plus riches.

## Concept

### Intersection (`&`)

```ts
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;
// { name: string; age: number }
```

### Union (`|`)

```ts
type Success = { ok: true; data: string };
type Failure = { ok: false; error: string };
type Result = Success | Failure;
```

### Combinaison

```ts
type Timestamped = { createdAt: Date };
type User = Named & Aged & Timestamped;
```

## Exemple

```ts
type WithId = { id: string };
type Entity = WithId & { name: string };
```

## Comment ça fonctionne

`&` fusionne les propriétés (intersection).  
`|` autorise l’une ou l’autre forme (union).  
Les type aliases servent de briques nommées pour ces compositions.

## Erreurs fréquentes

- Utiliser `|` quand on voulait `&` (et inversement)
- Créer des intersections conflictuelles (ex. `{ a: string } & { a: number }` → never)

## À retenir

- `|` = ou (union)
- `&` = et (intersection)
- Compose des aliases pour construire le modèle de domaine
- Attention aux conflits de propriétés dans les intersections

## Exercices

1. Compose un type `Admin` à partir de `User` et `{ role: "admin" }`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type User = { id: number; name: string };
   type Admin = User & { role: "admin" };
   ```
   :::

## Questions d'entretien


1. Quelle est la différence entre union (`|`) et intersection (`&`) ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   L’union (`|`) représente « l’un ou l’autre » (valeur compatible avec au moins un des types). L’intersection (`&`) représente « les deux à la fois » (valeur qui satisfait toutes les formes combinées).
   :::

