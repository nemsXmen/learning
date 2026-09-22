---
id: typescript-14-variance
title: Variance
slug: variance
technology: typescript
level: advanced
module: 14-generics-advanced
order: 12
estimatedMinutes: 20
difficulty: 3
xp: 60
prerequisites: [typescript-14-higher-order-generics]
skills: [generics]
tags: [typescript, generics, variance]
---

## Objectifs

- Comprendre covariance, contravariance et invariance
- Voir comment TypeScript traite les fonctions et les tableaux
- Appliquer `strictFunctionTypes`

## Introduction

La **variance** décrit comment la relation de sous-typage se propage à travers les types génériques.

## Concept

- **Covariance** : si A ⊂ B, alors `F<A>` ⊂ `F<B>` (ex. tableaux en lecture, retours de fonctions)
- **Contravariance** : si A ⊂ B, alors `F<B>` ⊂ `F<A>` (ex. paramètres de fonctions sous strictFunctionTypes)
- **Invariance** : ni l’un ni l’autre (souvent pour les positions en lecture-écriture)

```ts
type Animal = { name: string };
type Dog = Animal & { breed: string };

// Retour covariant
type Producer<T> = () => T;
const getDog: Producer<Dog> = () => ({ name: "Rex", breed: "Lab" });
const getAnimal: Producer<Animal> = getDog; // OK

// Paramètre contravariant (strictFunctionTypes)
type Consumer<T> = (value: T) => void;
const acceptAnimal: Consumer<Animal> = (a) => console.log(a.name);
const acceptDog: Consumer<Dog> = acceptAnimal; // OK
// acceptAnimal = acceptDog; // ❌
```

## Exemple

Les tableaux TypeScript sont traités de façon covariante pour des raisons historiques (comme en JS), ce qui peut être unsafe en écriture.

## Comment ça fonctionne

`strictFunctionTypes` active la contravariance stricte des paramètres pour les types de fonctions (sauf méthodes bivariantes pour compatibilité).

## Erreurs fréquentes

- Assigner des fonctions dans le « mauvais sens »
- Muter un tableau via une référence covariante trop large

## À retenir

- Retours : covariance
- Paramètres : contravariance (strictFunctionTypes)
- Tableaux : covariance (attention aux mutations)
- Concept avancé mais important pour les APIs sûres

## Exercices

1. Explique pourquoi `Producer<Dog>` est assignable à `Producer<Animal>`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Parce que le type de retour est covariant : un producteur de Dog produit aussi un Animal.
   :::

## Questions d'entretien

1. Qu’est-ce que la variance dans le contexte des generics TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   C’est la façon dont le sous-typage se propage à travers un type générique. Covariance pour les retours (et tableaux), contravariance pour les paramètres de fonctions sous strictFunctionTypes. Comprendre la variance évite des assignations incorrectes de fonctions et de collections.
   :::
