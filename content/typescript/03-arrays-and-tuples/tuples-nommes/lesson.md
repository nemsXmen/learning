---
id: typescript-03-tuples-nommes
title: Tuples nommés
slug: tuples-nommes
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-03-introduction-aux-tuples]
skills: [arrays-tuples]
tags: [typescript, tuples]
---

## Objectifs

- Utiliser les tuples nommés (labeled tuple elements)
- Améliorer la lisibilité des tuples
- Savoir que les labels n’existent qu’au niveau des types

## Introduction

TypeScript permet de nommer les positions d’un tuple pour plus de clarté.

## Concept

```ts
type Point = [x: number, y: number];
const p: Point = [10, 20];
```

Les labels `x` et `y` apparaissent dans l’autocomplétion et la documentation, mais n’existent pas à runtime.

```ts
function createPoint(x: number, y: number): [x: number, y: number] {
  return [x, y];
}
```

## Exemple

```ts
type HttpResponse = [status: number, body: string];
const res: HttpResponse = [200, "OK"];
```

## Comment ça fonctionne

Les labels sont purement informatifs pour le type-checker et l’éditeur. À runtime on a toujours un tableau classique.

## Erreurs fréquentes

- Croire qu’on peut faire `p.x` (non, c’est toujours `p[0]`)
- Oublier que les labels n’ajoutent pas de propriétés nommées

## À retenir

- Syntaxe : `[label: Type, ...]`
- Améliore la lisibilité
- N’existe qu’au niveau des types

## Exercices

1. Déclare un tuple nommé pour une couleur RGB.

   :::solution
   ```ts
   type RGB = [r: number, g: number, b: number];
   const red: RGB = [255, 0, 0];
   ```
   :::

## Questions d'entretien

1. Les labels des tuples nommés existent-ils à runtime ?

   :::reponse
   Non. Ce sont uniquement des annotations de type pour la lisibilité et l’autocomplétion. À runtime le tuple reste un tableau indexé numériquement.
   :::
