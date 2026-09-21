---
id: typescript-41-contravariance
title: Contravariance
slug: contravariance
technology: typescript
level: advanced
module: 41-advanced-generics
order: 8
estimatedMinutes: 10
difficulty: 3
xp: 45
prerequisites: [typescript-41-covariance]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Illustrer la contravariance
- Consumers / paramètres
- strictFunctionTypes

## Introduction

**Contravariance** : si Dog ≤ Animal, alors Consumer\<Animal\> ≤ Consumer\<Dog\>.

## Concept

```ts
type Consumer<T> = (value: T) => void;

const feedAnimal: Consumer<Animal> = (a) => {};
const feedDog: Consumer<Dog> = feedAnimal; // OK : un feeder d’Animal accepte un Dog
```

## Exemple

Callbacks d’événements, comparators.

## Comment ça fonctionne

Le consumer plus général (Animal) peut traiter le cas plus spécifique (Dog).

## Erreurs fréquentes

- Inverser le sens
- Mode bivariant non strict sur méthodes

## À retenir

- Inputs
- Consumer large → ok pour étroit
- strictFunctionTypes

## Exercices

1. feedDog peut-il être assigné à feedAnimal ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Non en général : un feeder de Dog ne sait pas gérer un Cat (autre Animal).
   :::

## Questions d'entretien

1. Contravariance des paramètres de fonction ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un paramètre plus large (supertype) est acceptable là où un plus étroit est attendu, car la fonction saura traiter la valeur. L’inverse est dangereux.
   :::
