---
id: typescript-26-type-erasure
title: Type erasure
slug: type-erasure
technology: typescript
level: intermediate
module: 26-typescript-and-javascript-runtime
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-26-compile-time-vs-runtime]
skills: [runtime]
tags: [typescript, type-erasure]
---

## Objectifs

- Comprendre l’effacement des types
- Voir ce qui disparaît à l’émission
- Identifier ce qui reste (enums, namespaces, classes…)

## Introduction

TypeScript pratique le **type erasure** : la plupart des constructions de types n’existent plus dans le JS émis.

## Concept

Effacés :
- `interface`, `type`, annotations
- Génériques
- Paramètres de type

Conservés (valeurs) :
- `class`, `enum` (non const), `namespace` (selon usage)
- Fonctions, objets, logique

```ts
interface User { id: string }
const u: User = { id: "1" };
// JS ≈ const u = { id: "1" };
```

## Exemple

```ts
function identity<T>(x: T): T { return x; }
// JS ≈ function identity(x) { return x; }
```

## Comment ça fonctionne

Le compilateur retire les informations de type après analyse. Le runtime n’a pas de réflexion de types TS native.

## Erreurs fréquentes

- Tester `instanceof` sur une interface (impossible)
- Attendre des métadonnées de types sans `emitDecoratorMetadata` / reflect-metadata

## À retenir

- Types = effacés
- Valeurs = émises
- Pas de réflexion de types native

## Exercices

1. Que reste-t-il de `type ID = string` dans le JS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Rien.
   :::

## Questions d'entretien

1. Qu’est-ce que le type erasure en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le fait que les constructions purement type-level (interfaces, type aliases, annotations, génériques…) sont supprimées à la compilation et n’existent pas dans le JavaScript exécuté.
   :::
