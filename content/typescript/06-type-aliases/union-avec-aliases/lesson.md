---
id: typescript-06-union-avec-aliases
title: Union avec les aliases
slug: union-avec-aliases
technology: typescript
level: beginner
module: 06-type-aliases
order: 6
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-06-alias-tuples]
skills: [type-aliases]
tags: [typescript, type-aliases, unions]
---

## Objectifs

- Créer des unions à partir de type aliases
- Composer des unions lisibles
- Voir les literal unions nommées

## Introduction

Les type aliases rendent les unions beaucoup plus lisibles et réutilisables.

## Concept

```ts
type Status = "pending" | "success" | "error";
type ID = string | number;

type Result = 
  | { ok: true; value: string }
  | { ok: false; error: string };
```

## Exemple

```ts
type Shape = "circle" | "square" | "triangle";

function getSides(shape: Shape): number {
  switch (shape) {
    case "circle": return 0;
    case "square": return 4;
    case "triangle": return 3;
  }
}
```

## Comment ça fonctionne

On peut unionner des aliases entre eux, des littéraux, des objets, etc. Le nom de l’alias documente le concept (Status, Result, Shape…).

## Erreurs fréquentes

- Créer des unions trop larges (`string | number | boolean | object`)
- Oublier le narrowing ensuite

## À retenir

- Les aliases rendent les unions lisibles
- Très puissant avec les literal types et les discriminated unions
- Nomme le concept métier

## Exercices

1. Crée un type `HttpMethod` pour les littéraux "GET" | "POST" | "PUT" | "DELETE".

   :::solution
   ```ts
   type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
   ```
   :::

## Questions d'entretien

1. Pourquoi encapsuler une union dans un type alias ?

   :::reponse
   Pour donner un nom clair au concept (Status, Role, Result…), éviter de répéter l’union partout, et faciliter les évolutions futures.
   :::
