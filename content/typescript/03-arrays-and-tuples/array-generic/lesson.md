---
id: typescript-03-array-generic
title: Array<string>
slug: array-generic
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 3
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-03-string-array]
skills: [arrays-tuples]
tags: [typescript, arrays, generic]
---

## Objectifs

- Connaître la syntaxe générique `Array<T>`
- Savoir qu’elle est équivalente à `T[]`
- Choisir entre les deux formes

## Introduction

`Array<string>` est strictement équivalent à `string[]`. C’est la forme générique.

## Concept

```ts
let a: string[] = ["a", "b"];
let b: Array<string> = ["a", "b"];
```

Les deux se comportent identiquement.

### Quand utiliser quelle forme ?

- `T[]` → la plus courante et la plus lisible au quotidien
- `Array<T>` → parfois préférée dans des signatures génériques complexes ou pour la cohérence visuelle avec d’autres génériques

## Exemple

```ts
function first<T>(items: Array<T>): T | undefined {
  return items[0];
}
```

## Comment ça fonctionne

`Array<T>` est l’interface générique du type tableau. `T[]` est du sucre syntaxique pour la même chose.

## Erreurs fréquentes

- Croire que les deux formes sont différentes
- Mélanger les styles dans un même fichier sans raison

## À retenir

- `Array<T>` ≡ `T[]`
- Préfère `T[]` pour la lisibilité quotidienne
- Les deux sont parfaitement valides

## Exercices

1. Réécris `let ids: number[] = []` avec la forme générique.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   let ids: Array<number> = [];
   ```
   :::

## Questions d'entretien


1. Y a-t-il une différence de comportement entre `string[]` et `Array<string>` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Non. Ce sont deux syntaxes pour le même type. `T[]` est du sucre syntaxique pour `Array<T>`.
   :::

