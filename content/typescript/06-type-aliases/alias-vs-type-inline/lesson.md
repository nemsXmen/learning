---
id: typescript-06-alias-vs-type-inline
title: Alias vs type inline
slug: alias-vs-type-inline
technology: typescript
level: beginner
module: 06-type-aliases
order: 10
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-06-composition-de-types]
skills: [type-aliases]
tags: [typescript, type-aliases, bonnes-pratiques]
---

## Objectifs

- Savoir quand créer un type alias et quand laisser un type inline
- Éviter la sur-abstraction et la sous-abstraction
- Avoir des règles pragmatiques

## Introduction

Tout n’a pas besoin d’être nommé. L’équilibre entre alias et type inline est une question de lisibilité et de réutilisation.

## Concept

### Préfère un alias quand :

- Le type est réutilisé à plusieurs endroits
- Il représente un concept métier clair
- La forme est assez complexe pour mériter un nom

### Préfère un type inline quand :

- Le type n’est utilisé qu’une seule fois
- Il est simple et évident dans le contexte
- Le nommer n’apporterait pas de clarté

```ts
// Inline OK
function log(point: { x: number; y: number }) { ... }

// Alias préférable
type Point = { x: number; y: number };
function distance(a: Point, b: Point): number { ... }
```

## Exemple

```ts
// Trop d’aliases inutiles
type X = number;
type Y = number;
type Point = { x: X; y: Y }; // souvent excessif

// Bon équilibre
type Point = { x: number; y: number };
```

## Comment ça fonctionne

Il n’y a pas de règle absolue. L’objectif est la clarté pour le lecteur suivant (qui peut être toi dans 6 mois).

## Erreurs fréquentes

- Nommer absolument tout (bruit)
- Ne jamais nommer (duplication et formes anonymes partout)

## À retenir

- Réutilisation + concept métier → alias
- Usage unique + forme simple → inline
- La lisibilité est le critère principal

## Exercices

1. Pour chaque cas, choisis alias ou inline :
   - Un point {x, y} utilisé dans 5 fonctions
   - Un callback unique `(n: number) => void` dans une seule fonction

   :::solution
   - Point → alias
   - Callback unique → inline (ou type local si vraiment utile)
   :::

## Questions d'entretien

1. Quand crées-tu un type alias plutôt qu’un type inline ?

   :::reponse
   Quand le type est réutilisé, qu’il représente un concept clair, ou que sa complexité justifie un nom. Pour les formes simples et locales, l’inline reste souvent plus lisible.
   :::
