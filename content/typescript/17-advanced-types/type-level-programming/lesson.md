---
id: typescript-17-type-level-programming
title: Type-level programming
slug: type-level-programming
technology: typescript
level: advanced
module: 17-advanced-types
order: 10
estimatedMinutes: 15
difficulty: 3
xp: 60
prerequisites: [typescript-17-distributive-conditional-types]
skills: [advanced-types]
tags: [typescript, type-level]
---

## Objectifs

- Comprendre la programmation au niveau des types
- Voir ce qui est possible (et ce qui ne l’est pas)
- Rester pragmatique

## Introduction

Le **type-level programming** utilise le système de types comme un langage de transformation de types.

## Concept

Outils principaux :
- Conditional types + infer
- Mapped types
- Template literal types
- Recursion de types
- Utilitaires standards (Pick, Omit, Exclude…)

```ts
type Lines = "a:1,b:2";
// On pourrait parser au niveau des types (exercices avancés)
type Split<S extends string, D extends string> =
  S extends `${infer H}${D}${infer R}` ? [H, ...Split<R, D>] : [S];
```

## Exemple

Beaucoup de bibliothèques (tRPC, Zod, Prisma) s’appuient sur du type-level programming pour inférer des types riches.

## Comment ça fonctionne

Tout se passe à la compilation. Le runtime n’en voit rien. La complexité a un coût (temps de compile, lisibilité).

## Erreurs fréquentes

- Sur-ingénierie type-level pour des problèmes simples
- Types illisibles pour l’équipe

## À retenir

- Type-level = transformations de types à la compile
- Puissant pour les bibliothèques et les APIs typées
- Lisibilité et pragmatisme d’abord

## Exercices

1. Utilise Split pour découper `"a,b,c"` sur `","` (conceptuellement).

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Parts = Split<"a,b,c", ",">; // ["a", "b", "c"]
   ```
   :::

## Questions d'entretien

1. Qu’est-ce que le type-level programming en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   C’est l’usage du système de types (conditional types, mapped types, infer, template literals, récursion…) pour calculer et transformer des types à la compilation. Très utile pour des APIs ultra-typées, au prix d’une complexité accrue.
   :::
