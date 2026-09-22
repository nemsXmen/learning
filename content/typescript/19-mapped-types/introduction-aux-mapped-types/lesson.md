---
id: typescript-19-introduction-aux-mapped-types
title: Introduction aux mapped types
slug: introduction-aux-mapped-types
technology: typescript
level: advanced
module: 19-mapped-types
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-17-mapped-types]
skills: [mapped-types]
tags: [typescript, mapped-types]
---

## Objectifs

- Comprendre le rôle des mapped types
- Lire la syntaxe de base
- Voir le lien avec Partial / Readonly

## Introduction

Les **mapped types** permettent de transformer systématiquement les propriétés d’un type.

## Concept

```ts
type Mirror<T> = {
  [K in keyof T]: T[K];
};

type User = { id: number; name: string };
type Same = Mirror<User>; // { id: number; name: string }
```

C’est le mécanisme derrière `Partial`, `Required`, `Readonly`, `Pick`, etc.

## Exemple

```ts
type StringifyProps<T> = {
  [K in keyof T]: string;
};
```

## Comment ça fonctionne

`[K in keyof T]` itère sur chaque clé. On produit une nouvelle propriété pour chaque clé, avec un type de valeur éventuellement transformé.

## Erreurs fréquentes

- Oublier les crochets et `in`
- Confondre avec un index signature classique

## À retenir

- `{ [K in keyof T]: ... }`
- Transformation systématique des props
- Base des utility types objets

## Exercices

1. Écris un mapped type qui copie T sans le modifier.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Identity<T> = { [K in keyof T]: T[K] };
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qu’un mapped type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un type qui itère sur les clés d’un autre type (`[K in keyof T]`) pour construire un nouvel objet type, en transformant éventuellement optionalité, readonly ou le type des valeurs.
   :::
