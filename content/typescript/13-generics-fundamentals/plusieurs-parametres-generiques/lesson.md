---
id: typescript-13-plusieurs-parametres-generiques
title: Plusieurs paramètres génériques
slug: plusieurs-parametres-generiques
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-13-generic-aliases]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Utiliser plusieurs paramètres de type
- Les faire collaborer dans une signature
- Voir des exemples (map, pair, pluck…)

## Introduction

On peut déclarer autant de paramètres de type que nécessaire.

## Concept

```ts
function map<T, U>(items: T[], fn: (item: T) => U): U[] {
  return items.map(fn);
}

function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}
```

```ts
type Mapper<T, U> = (value: T) => U;
```

## Exemple

```ts
function zip<T, U>(a: T[], b: U[]): [T, U][] {
  const len = Math.min(a.length, b.length);
  const result: [T, U][] = [];
  for (let i = 0; i < len; i++) {
    result.push([a[i], b[i]]);
  }
  return result;
}
```

## Comment ça fonctionne

Chaque paramètre est indépendant et fixé (par inférence ou explicitement) à l’appel. L’ordre dans `<T, U>` compte pour les arguments de type explicites.

## Erreurs fréquentes

- Trop de paramètres (API confuse)
- Noms peu clairs

## À retenir

- `<T, U, V…>` autant que nécessaire
- Chaque paramètre a un rôle distinct
- Noms explicites pour les APIs complexes

## Exercices

1. Écris une fonction `combine<A, B>` qui retourne `{ first: A; second: B }`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function combine<A, B>(first: A, second: B): { first: A; second: B } {
     return { first, second };
   }
   ```
   :::

## Questions d'entretien

1. Peut-on avoir plusieurs paramètres de type sur une même fonction ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Oui. On les déclare entre chevrons séparés par des virgules : `function f<T, U>(...)`. Chacun est inféré ou spécifié indépendamment.
   :::
