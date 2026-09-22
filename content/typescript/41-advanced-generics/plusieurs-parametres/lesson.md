---
id: typescript-41-plusieurs-parametres
title: Plusieurs paramètres
slug: plusieurs-parametres
technology: typescript
level: advanced
module: 41-advanced-generics
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-41-contraintes-complexes]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Gérer plusieurs type params
- Ordre et dépendances
- Cas map / convert

## Introduction

Les utilitaires avancés ont souvent **plusieurs paramètres de type**.

## Concept

```ts
function mapValues<T extends object, U>(
  obj: T,
  fn: (value: T[keyof T]) => U
): { [K in keyof T]: U } {
  // ...
}

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```

## Exemple

`E = Error` : second param avec défaut.

## Comment ça fonctionne

L’ordre compte pour l’inférence. Les params suivants peuvent dépendre des précédents via contraintes.

## Erreurs fréquentes

- Ordre qui bloque l’inférence
- Trop de params illisibles

## À retenir

- Multi-params
- Défauts
- Dépendances via extends

## Exercices

1. Type Pair\<A, B\> = { left: A; right: B }.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Pair<A, B> = { left: A; right: B };
   ```
   :::

## Questions d'entretien

1. Pourquoi l’ordre des paramètres génériques compte-t-il ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que l’inférence et les valeurs par défaut s’appliquent dans l’ordre ; un paramètre peut aussi être contraint par un précédent (`K extends keyof T`).
   :::
