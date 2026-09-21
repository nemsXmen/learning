---
id: typescript-25-no-implicit-any
title: noImplicitAny
slug: no-implicit-any
technology: typescript
level: intermediate
module: 25-tsconfig
order: 6
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-25-strict]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Comprendre `noImplicitAny`
- Forcer l’annotation quand l’inférence échoue
- Éviter les any silencieux

## Introduction

Avec `noImplicitAny`, TypeScript refuse les types `any` **implicites**.

## Concept

```ts
// Erreur si noImplicitAny
function f(x) {
  return x;
}

// OK
function f(x: string) {
  return x;
}
```

## Exemple

Inclus dans `strict`.

## Comment ça fonctionne

Si le compilateur ne peut pas inférer un type, il exige une annotation explicite au lieu d’assumer `any`.

## Erreurs fréquentes

- Ajouter `any` explicite pour « faire taire » (contourne l’esprit de l’option)

## À retenir

- Pas d’any implicite
- Annoter ou mieux typer
- Inclus dans strict

## Exercices

1. Corrige `function id(x) { return x; }` sous noImplicitAny.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function id<T>(x: T): T { return x; }
   // ou function id(x: unknown) { return x; }
   ```
   :::

## Questions d'entretien

1. Que change `noImplicitAny` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il interdit les any implicites : si TypeScript ne peut pas inférer un type, il faut annoter explicitement au lieu de laisser any silencieusement.
   :::
