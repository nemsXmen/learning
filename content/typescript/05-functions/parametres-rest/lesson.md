---
id: typescript-05-parametres-rest
title: Paramètres rest
slug: parametres-rest
technology: typescript
level: beginner
module: 05-functions
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-05-parametres-par-defaut]
skills: [functions]
tags: [typescript, functions, rest]
---

## Objectifs

- Utiliser les paramètres rest (`...args`)
- Les typer correctement
- Les placer en dernière position

## Introduction

Les paramètres rest permettent de capturer un nombre variable d’arguments sous forme de tableau.

## Concept

```ts
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3); // 6
sum(10, 20);  // 30
```

Le rest doit être le **dernier** paramètre.

## Exemple

```ts
function log(message: string, ...details: unknown[]) {
  console.log(message, ...details);
}
```

## Comment ça fonctionne

`...name: Type[]` regroupe tous les arguments restants dans un tableau de type `Type[]`.

## Erreurs fréquentes

- Mettre le rest ailleurs qu’en dernière position
- Oublier le type du tableau (`...args` sans annotation → any[] en non-strict)

## À retenir

- Syntaxe : `...name: Type[]`
- Toujours en dernier
- Utile pour les fonctions variadiques

## Exercices

1. Écris une fonction `max` qui prend au moins un number et un rest de numbers, et retourne le maximum.

   :::solution
   ```ts
   function max(first: number, ...rest: number[]): number {
     return Math.max(first, ...rest);
   }
   ```
   :::

## Questions d'entretien

1. Où doit se trouver le paramètre rest dans une signature de fonction ?

   :::reponse
   Toujours en dernière position. TypeScript (et JavaScript) n’autorise qu’un seul rest parameter et il doit être à la fin.
   :::
