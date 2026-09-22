---
id: typescript-42-les-types-comme-langage
title: Les types comme langage
slug: les-types-comme-langage
technology: typescript
level: advanced
module: 42-type-level-programming
order: 1
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-41-builders-types]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Voir le système de types comme un langage
- Expressions, branches, récursion
- Limites et objectifs

## Introduction

Le **type-level programming** traite les types comme des valeurs d’un langage fonctionnel restreint.

## Concept

Au niveau des types on dispose de :
- « valeurs » : string, number, unions, objets…
- « fonctions » : génériques, mapped, conditionnels
- branches : `T extends U ? X : Y`
- récursion bornée

```ts
type IsString<T> = T extends string ? true : false;
```

## Exemple

Calculer des types dérivés (routes, events, deep partial) sans runtime.

## Comment ça fonctionne

Tout est effacé à la compilation. Le but est la sûreté et l’autocomplete, pas l’exécution.

## Erreurs fréquentes

- Logique métier runtime au type-level
- Complexité illisible

## À retenir

- Types = calcul compile-time
- Objectif DX/sûreté
- Lisibilité d’abord

## Exercices

1. IsString<"a"> vaut ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   true
   :::

## Questions d'entretien

1. Qu’est-ce que le type-level programming en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   L’usage du système de types (conditionnels, mapped, infer, récursion) pour calculer et contraindre des formes de données à la compilation, améliorant sûreté et DX sans coût runtime.
   :::
