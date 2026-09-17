---
id: typescript-04-structural-typing
title: Structural typing
slug: structural-typing
technology: typescript
level: beginner
module: 04-objects
order: 10
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-04-excess-property-checking]
skills: [objects]
tags: [typescript, objects, structural-typing]
---

## Objectifs

- Comprendre le typage structurel (duck typing)
- Voir en quoi il diffère du typage nominal
- Savoir en tirer parti

## Introduction

TypeScript utilise un **typage structurel** : la compatibilité se base sur la forme des valeurs, pas sur leur nom de type.

## Concept

```ts
type Point2D = { x: number; y: number };
type Point3D = { x: number; y: number; z: number };

const p3: Point3D = { x: 1, y: 2, z: 3 };
const p2: Point2D = p3; // OK – p3 a au moins x et y
```

Dès qu’un objet possède les propriétés requises avec les bons types, il est compatible, même s’il en a plus.

## Exemple

```ts
function printX(p: { x: number }) {
  console.log(p.x);
}

printX({ x: 10, y: 20 }); // OK
printX({ x: 10 });        // OK
```

## Comment ça fonctionne

TypeScript compare les membres. C’est l’opposé des langages à typage nominal (Java, C#) où le nom du type compte.

## Erreurs fréquentes

- S’étonner qu’un type « différent » soit accepté
- Croire qu’il faut des `implements` partout (utile pour la documentation, pas obligatoire pour la compatibilité)

## À retenir

- TypeScript = typage structurel
- « Si ça a la bonne forme, c’est compatible »
- Très flexible et adapté à JavaScript
- Les interfaces et types nommés restent utiles pour la clarté

## Exercices

1. Pourquoi peut-on assigner un Point3D à une variable Point2D ?

   :::solution
   Parce que Point3D possède au minimum les propriétés x et y de Point2D (typage structurel).
   :::

## Questions d'entretien

1. Qu’est-ce que le typage structurel en TypeScript ?

   :::reponse
   La compatibilité des types se base sur leur structure (les propriétés et leurs types), pas sur le nom du type. Si un objet a au moins les membres requis, il est compatible.
   :::
