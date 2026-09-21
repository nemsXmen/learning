---
id: typescript-41-variance
title: Variance
slug: advanced-variance
technology: typescript
level: advanced
module: 41-advanced-generics
order: 6
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-41-partial-inference]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Comprendre la variance des types
- Positions co/contra/in
- Impact sur les assignabilités

## Introduction

La **variance** décrit comment la relation de sous-typage se propage dans les génériques.

## Concept

- **Covariance** : `Array<Dog>` traité comme `Array<Animal>` (lecture)
- **Contravariance** : fonctions paramètres (écriture/input)
- **Invariance** : ni l’un ni l’autre (souvent mutable)

```ts
type Producer<out T> = () => T; // co (conceptuel)
type Consumer<in T> = (value: T) => void; // contra
```

## Exemple

TypeScript est structural et a des règles spécifiques (ex. fonctions bivariantes en mode non strict pour les méthodes).

## Comment ça fonctionne

La position d’un type param (input vs output) dicte la variance sûre.

## Erreurs fréquentes

- Supposer covariance partout
- Ignorer strictFunctionTypes

## À retenir

- Co = outputs
- Contra = inputs
- Invariant si les deux

## Exercices

1. (x: Animal) => void est-il assignable à (x: Dog) => void en strict ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Oui (contravariance des paramètres) — un consumer d’Animal peut accepter un Dog.
   :::

## Questions d'entretien

1. Qu’est-ce que la variance en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   La façon dont le sous-typage des arguments de type se propage : covariance pour les positions de sortie, contravariance pour les entrées, invariance quand lecture et écriture se mélangent.
   :::
