---
id: typescript-38-quand-utiliser-ou-eviter
title: Quand utiliser ou éviter un pattern
slug: quand-utiliser-ou-eviter
technology: typescript
level: intermediate
module: 38-design-patterns
order: 14
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-patterns-type-safe]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Décider d’introduire un pattern
- Reconnaître la sur-ingénierie
- Préférer la simplicité typée

## Introduction

Un pattern est un **outil**, pas un objectif. TypeScript réduit parfois le besoin de patterns lourds.

## Concept

Utiliser un pattern quand :
- le changement est fréquent (Strategy, Adapter)
- le découplage est requis (Repository, DI)
- le domaine a des états/règles riches (State, Specification)

Éviter quand :
- une fonction suffit
- le pattern n’est compris que par son auteur
- on copie un tutoriel sans pain point réel

## Exemple

Préférer une union + fonctions pures à une hiérarchie de classes State si le cas reste simple.

## Comment ça fonctionne

YAGNI + lisibilité. Les types (unions, génériques) remplacent parfois des hiérarchies.

## Erreurs fréquentes

- Pattern zoo dans un CRUD simple
- Abstractions prématurées

## À retenir

- Pain point d’abord
- Types simples > classes
- Refactor vers pattern si besoin

## Exercices

1. CRUD simple sans règles : faut-il une machine State complète ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Souvent non — une union de status et quelques fonctions suffisent.
   :::

## Questions d'entretien

1. Comment décides-tu d’appliquer un design pattern en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Je pars du problème (variation, découplage, états). Si une solution simple typée suffit, je l’utilise. J’introduis un pattern quand la complexité le justifie, pas par principe.
   :::
