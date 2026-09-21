---
id: typescript-12-string-enums
title: String enums
slug: string-enums
technology: typescript
level: intermediate
module: 12-enums
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-12-numeric-enums]
skills: [enums]
tags: [typescript, enums]
---

## Objectifs

- Déclarer des enums de strings
- Comprendre leurs avantages
- Les comparer aux numeric enums

## Introduction

Les **string enums** assignent des chaînes explicites à chaque membre.

## Concept

```ts
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}

let dir: Direction = Direction.Up; // "UP"
```

Chaque membre **doit** avoir une valeur string explicite (pas d’auto-incrémentation).

## Exemple

```ts
enum LogLevel {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error"
}
```

## Comment ça fonctionne

Les string enums sont plus lisibles dans les logs et le debug (on voit `"UP"` plutôt que `0`). Ils n’ont pas de reverse mapping automatique.

## Erreurs fréquentes

- Oublier d’initialiser un membre
- Mélanger string et number dans le même enum (enum hétérogène, à éviter)

## À retenir

- Valeurs string explicites obligatoires
- Meilleure lisibilité runtime
- Pas de reverse mapping

## Exercices

1. Crée un string enum `Role` avec Admin = "admin", User = "user".

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   enum Role {
     Admin = "admin",
     User = "user"
   }
   ```
   :::

## Questions d'entretien


1. Quel avantage principal ont les string enums sur les numeric enums ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   La lisibilité à runtime : les valeurs affichées dans les logs ou le debug sont des chaînes significatives plutôt que des nombres opaques. Ils évitent aussi les reverse mappings parfois surprenants.
   :::

