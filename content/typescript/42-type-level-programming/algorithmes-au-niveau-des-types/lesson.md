---
id: typescript-42-algorithmes-au-niveau-des-types
title: Algorithmes au niveau des types
slug: algorithmes-au-niveau-des-types
technology: typescript
level: advanced
module: 42-type-level-programming
order: 14
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-42-state-machines]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Voir addition / comparaison type-level
- Limites pratiques
- Quand s’arrêter

## Introduction

On peut encoder de petits **algorithmes** (compteurs, addition de tuples) au type-level.

## Concept

```ts
type BuildTuple<N extends number, Acc extends unknown[] = []> =
  Acc["length"] extends N ? Acc : BuildTuple<N, [...Acc, unknown]>;

type Add<A extends number, B extends number> =
  [...BuildTuple<A>, ...BuildTuple<B>]["length"];
```

## Exemple

Comparaison de longueurs, prise de N premiers éléments d’un tuple.

## Comment ça fonctionne

Les tuples comme compteurs de Peano « pauvres ». Très vite coûteux pour tsc.

## Erreurs fréquentes

- Calculs numériques complexes en types
- CI lente

## À retenir

- Possible mais cher
- Préférer runtime si métier
- Type-level pour formes, pas pour arithmétique lourde

## Exercices

1. Add\<1, 2\> (idée) ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   3 (via longueur de tuple concaténée).
   :::

## Questions d'entretien

1. Faut-il faire de l’arithmétique au type-level ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Rarement pour du métier. C’est pédagogique ou pour de petites contraintes de longueur. Au-delà, le coût compilateur et la lisibilité plaident pour le runtime.
   :::
