---
id: typescript-41-covariance
title: Covariance
slug: covariance
technology: typescript
level: advanced
module: 41-advanced-generics
order: 7
estimatedMinutes: 10
difficulty: 3
xp: 45
prerequisites: [typescript-41-variance]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Illustrer la covariance
- Readonly / producers
- Cas sûrs

## Introduction

**Covariance** : si Dog ≤ Animal, alors Producer\<Dog\> ≤ Producer\<Animal\>.

## Concept

```ts
type Producer<T> = () => T;

const getDog: Producer<Dog> = () => new Dog();
const getAnimal: Producer<Animal> = getDog; // OK conceptuellement
```

## Exemple

`ReadonlyArray<Dog>` est covariante en pratique pour la lecture.

## Comment ça fonctionne

On ne fait que **produire** T (sortie) → élargir T est sûr.

## Erreurs fréquentes

- Appliquer covariance à des tableaux mutables (push unsafe)

## À retenir

- Sortie seulement
- Readonly
- Élargissement sûr

## Exercices

1. Pourquoi push sur Array\<Animal\> avec une ref Array\<Dog\> est dangereux ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   On pourrait y pousser un Cat, cassant l’invariant Dog[].
   :::

## Questions d'entretien

1. Quand la covariance est-elle sûre ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Quand le type paramètre apparaît en position de sortie seulement (lecture/production), pas en écriture mutable.
   :::
