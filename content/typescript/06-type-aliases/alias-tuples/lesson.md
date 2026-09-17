---
id: typescript-06-alias-tuples
title: Alias de tuples
slug: alias-tuples
technology: typescript
level: beginner
module: 06-type-aliases
order: 5
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-06-alias-tableaux]
skills: [type-aliases]
tags: [typescript, type-aliases, tuples]
---

## Objectifs

- Créer des type aliases pour des tuples
- Utiliser les tuples nommés dans les aliases
- Clarifier les retours multiples

## Introduction

Les tuples gagnent beaucoup en lisibilité quand ils sont nommés.

## Concept

```ts
type Point = [number, number];
type NamedPoint = [x: number, y: number];

type HttpResult = [status: number, body: string];
```

## Exemple

```ts
type Range = [start: number, end: number];

function createRange(start: number, end: number): Range {
  return [start, end];
}

const [from, to] = createRange(1, 10);
```

## Comment ça fonctionne

L’alias donne un nom stable au tuple, ce qui documente l’intention (coordonnée, plage, résultat HTTP…).

## Erreurs fréquentes

- Utiliser un tuple quand un objet nommé serait plus clair
- Oublier les labels sur les tuples complexes

## À retenir

- `type Nom = [Type1, Type2, ...]`
- Les labels améliorent encore la lisibilité
- Idéal pour les retours multiples et les structures ordonnées fixes

## Exercices

1. Crée un type `RGB` pour un tuple de 3 numbers avec labels.

   :::solution
   ```ts
   type RGB = [r: number, g: number, b: number];
   ```
   :::

## Questions d'entretien

1. Pourquoi aliaser un tuple plutôt que de l’écrire inline ?

   :::reponse
   Pour documenter le sens des positions (ex. Point, Range, HttpResult) et réutiliser la même forme à plusieurs endroits.
   :::
