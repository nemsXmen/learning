---
id: typescript-03-tuple-vs-array
title: Tuple vs Array
slug: tuple-vs-array
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 12
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-03-destructuration-de-tuples]
skills: [arrays-tuples]
tags: [typescript, tuples, arrays]
---

## Objectifs

- Savoir quand choisir un tuple plutôt qu’un tableau
- Résumer les différences clés
- Éviter les mauvais usages

## Introduction

Tuple et Array se ressemblent à runtime mais n’ont pas le même rôle au niveau des types.

## Concept

| Critère              | Array (`T[]`)              | Tuple (`[T, U, ...]`)          |
|----------------------|----------------------------|--------------------------------|
| Longueur             | Variable                   | Fixe (ou partiellement fixe)   |
| Types des éléments   | Homogène (un seul T)       | Hétérogène possible            |
| Accès                | Index numérique            | Index + types positionnels     |
| Cas d’usage          | Listes                    | Coordonnées, retours multiples, paires |

## Exemple

```ts
// Liste de scores → Array
const scores: number[] = [10, 20, 30];

// Coordonnée → Tuple
const point: [number, number] = [10, 20];

// Retour multiple → Tuple
function divide(a: number, b: number): [number, number] {
  return [Math.floor(a / b), a % b];
}
```

## Comment ça fonctionne

À runtime les deux sont des tableaux JavaScript. La différence est purement au niveau du système de types et de l’intention.

## Erreurs fréquentes

- Utiliser un tuple pour une liste de longueur inconnue
- Utiliser un array quand les positions ont des sens différents (préfère un objet ou un tuple nommé)

## À retenir

- Array = liste homogène de longueur variable
- Tuple = structure de longueur (semi-)fixe avec types positionnels
- Quand les positions ont un sens, un objet est souvent encore plus clair qu’un tuple

## Exercices

1. Pour chacune des situations, choisis Array ou Tuple :

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   - Liste d’utilisateurs

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   - Paire latitude/longitude

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   - Résultat + reste d’une division

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution

   - Liste d’utilisateurs → Array


   - Latitude/longitude → Tuple (ou mieux un objet)


   - Résultat + reste → Tuple

   :::

## Questions d'entretien


1. Quand préfères-tu un tuple à un tableau classique ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Quand la longueur est fixe (ou semi-fixe) et que chaque position a un rôle/type distinct : coordonnées, retours multiples, paires ordonnées. Pour les listes homogènes de longueur variable, on reste sur un Array.
   :::

