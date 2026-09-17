---
id: typescript-06-introduction-a-type
title: Introduction à `type`
slug: introduction-a-type
technology: typescript
level: beginner
module: 06-type-aliases
order: 1
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-05-function-types]
skills: [type-aliases]
tags: [typescript, type-aliases]
---

## Objectifs

- Comprendre ce qu’est un type alias
- Savoir le déclarer avec le mot-clé `type`
- Voir pourquoi nommer les types est utile

## Introduction

Un **type alias** donne un nom à un type. C’est l’un des outils les plus utilisés en TypeScript pour rendre le code lisible et maintenable.

## Concept

```ts
type UserId = string;
type Age = number;
type Point = { x: number; y: number };
```

Une fois défini, tu réutilises le nom partout :

```ts
function getUser(id: UserId): Point {
  return { x: 0, y: 0 };
}
```

Le type alias n’existe qu’à la compilation : il est complètement effacé dans le JavaScript généré.

## Exemple

```ts
type Status = "pending" | "success" | "error";

function setStatus(status: Status) {
  // ...
}
```

## Comment ça fonctionne

`type Nom = Type` crée un alias. Tu peux aliaser n’importe quel type : primitif, objet, union, intersection, fonction, tuple, etc.

## Erreurs fréquentes

- Croire qu’un type alias crée un nouveau type nominal (ce n’est pas le cas ; le typage reste structurel)
- Dupliquer des formes d’objets au lieu de les nommer

## À retenir

- `type Nom = ...` donne un nom réutilisable à un type
- Améliore la lisibilité et évite la duplication
- N’existe qu’à la compilation

## Exercices

1. Crée un type alias `Email` pour `string` et utilise-le dans une fonction.

   :::solution
   ```ts
   type Email = string;
   function send(to: Email) {
     console.log(to);
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qu’un type alias et à quoi sert-il ?

   :::reponse
   C’est un nom donné à un type via `type Nom = Type`. Il sert à documenter, réutiliser et éviter la duplication de formes de types complexes.
   :::
