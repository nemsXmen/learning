---
id: typescript-03-string-array
title: string[]
slug: string-array
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 2
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-03-tableaux-types]
skills: [arrays-tuples]
tags: [typescript, arrays, string]
---

## Objectifs

- Maîtriser la syntaxe `string[]`
- Voir les opérations courantes typées
- Comprendre l’inférence sur les tableaux de strings

## Introduction

`string[]` est la forme la plus fréquente de tableau typé.

## Concept

```ts
const fruits: string[] = ["pomme", "banane", "orange"];
fruits.push("kiwi");
const upper = fruits.map(f => f.toUpperCase()); // string[]
```

L’inférence fonctionne aussi :

```ts
const colors = ["red", "green", "blue"]; // string[]
```

## Exemple

```ts
function joinNames(names: string[]): string {
  return names.join(", ");
}
```

## Comment ça fonctionne

Toutes les méthodes d’Array sont typées. `filter`, `map`, `find`, `includes`… retournent des types cohérents avec `string[]`.

## Erreurs fréquentes

- Écrire `String[]` (objet) au lieu de `string[]`
- Oublier que `find` retourne `string | undefined`

## À retenir

- `string[]` = tableau de chaînes
- Syntaxe courte et idiomatique
- Les méthodes d’Array restent parfaitement typées

## Exercices

1. Écris une fonction qui prend un `string[]` et retourne le nombre d’éléments non vides.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function countNonEmpty(items: string[]): number {
     return items.filter(s => s.length > 0).length;
   }
   ```
   :::

## Questions d'entretien


1. Quelle est la différence entre `string[]` et `String[]` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   `string[]` est un tableau du primitif string. `String[]` serait un tableau d’objets String (wrapper), ce qu’on évite presque toujours.
   :::

