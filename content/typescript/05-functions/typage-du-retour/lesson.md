---
id: typescript-05-typage-du-retour
title: Typage du retour
slug: typage-du-retour
technology: typescript
level: beginner
module: 05-functions
order: 2
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-05-typage-des-parametres]
skills: [functions]
tags: [typescript, functions, return]
---

## Objectifs

- Annoter le type de retour d’une fonction
- Comprendre l’inférence de retour
- Savoir quand forcer une annotation de retour

## Introduction

Le type de retour fait partie du contrat de la fonction. On peut le laisser inférer ou l’annoter explicitement.

## Concept

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

Sans annotation, TypeScript infère souvent correctement :

```ts
function add(a: number, b: number) {
  return a + b; // retour inféré : number
}
```

Annoter explicitement est utile pour :
- Documenter l’intention
- Détecter les retours accidentels du mauvais type
- Les fonctions publiques / API

## Exemple

```ts
function getLabel(status: "ok" | "error"): string {
  if (status === "ok") return "Succès";
  return "Erreur";
}
```

## Comment ça fonctionne

TypeScript vérifie que toutes les branches de retour sont compatibles avec le type annoté (ou avec le type inféré).

## Erreurs fréquentes

- Annoter `: void` et retourner une valeur
- Oublier un `return` dans une branche (surtout avec `undefined`)
- Sur-annoter des fonctions internes triviales

## À retenir

- L’inférence de retour fonctionne bien
- Annoter les API publiques et les cas non évidents
- Toutes les branches doivent être cohérentes

## Exercices

1. Annoter le retour d’une fonction qui retourne true si un nombre est pair.

   :::solution
   ```ts
   function isEven(n: number): boolean {
     return n % 2 === 0;
   }
   ```
   :::

## Questions d'entretien

1. Quand annotes-tu explicitement le type de retour ?

   :::reponse
   Sur les fonctions publiques, quand le retour n’est pas évident, ou pour documenter clairement le contrat. À l’intérieur des modules, l’inférence suffit souvent.
   :::
