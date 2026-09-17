---
id: typescript-12-numeric-enums
title: Numeric enums
slug: numeric-enums
technology: typescript
level: intermediate
module: 12-enums
order: 1
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-09-literal-unions]
skills: [enums]
tags: [typescript, enums]
---

## Objectifs

- Déclarer des enums numériques
- Comprendre l’auto-incrémentation
- Voir les valeurs par défaut

## Introduction

Les **enums** TypeScript permettent de définir un ensemble de constantes nommées. Les enums numériques sont la forme historique.

## Concept

```ts
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

let dir: Direction = Direction.Up;
```

On peut fixer des valeurs :

```ts
enum Status {
  Pending = 1,
  Active = 2,
  Done = 3
}
```

Sans valeur explicite, TypeScript auto-incrémente à partir de 0 (ou à partir de la dernière valeur numérique).

## Exemple

```ts
enum HttpCode {
  OK = 200,
  NotFound = 404,
  ServerError = 500
}
```

## Comment ça fonctionne

Un enum numérique est compilé en un objet JavaScript (sauf `const enum`). Les membres ont des valeurs number.

## Erreurs fréquentes

- Mélanger valeurs calculées de façon opaque
- S’appuyer sur l’ordre auto-incrémenté sans le documenter

## À retenir

- `enum Nom { A, B, C }` → 0, 1, 2 par défaut
- Valeurs numériques explicites possibles
- Existe à runtime (objet JS)

## Exercices

1. Crée un enum `Priority` avec Low = 1, Medium = 2, High = 3.

   :::solution
   ```ts
   enum Priority {
     Low = 1,
     Medium = 2,
     High = 3
   }
   ```
   :::

## Questions d'entretien

1. Comment fonctionnent les valeurs d’un enum numérique sans initialisation explicite ?

   :::reponse
   TypeScript assigne 0 au premier membre, puis incrémente de 1 pour chaque membre suivant. On peut aussi fixer une valeur de départ ; les suivants s’incrémentent à partir de celle-ci.
   :::
