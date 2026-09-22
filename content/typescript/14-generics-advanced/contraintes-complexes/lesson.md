---
id: typescript-14-contraintes-complexes
title: Contraintes génériques complexes
slug: contraintes-complexes
technology: typescript
level: intermediate
module: 14-generics-advanced
order: 1
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-13-generic-constraints]
skills: [generics]
tags: [typescript, generics, constraints]
---

## Objectifs

- Écrire des contraintes plus riches
- Combiner plusieurs bornes
- Utiliser des contraintes conditionnelles simples

## Introduction

Au-delà de `T extends { length: number }`, on peut construire des contraintes sophistiquées.

## Concept

```ts
type HasId = { id: string };
type HasTimestamps = { createdAt: Date; updatedAt: Date };

function save<T extends HasId & HasTimestamps>(entity: T): T {
  // entity a id + timestamps
  return entity;
}
```

Contrainte sur une union de littéraux :

```ts
function setMode<T extends "light" | "dark">(mode: T): T {
  return mode;
}
```

## Exemple

```ts
function pickKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}
```

## Comment ça fonctionne

Les contraintes peuvent être des intersections, des unions, des interfaces, ou des types utilitaires. Plus la contrainte est précise, plus le corps de la fonction peut être typé finement.

## Erreurs fréquentes

- Contraintes trop larges (peu d’utilité) ou trop strictes (API inutilisable)
- Oublier que `extends` est de l’assignabilité, pas de l’égalité

## À retenir

- Contraintes = intersections, unions, interfaces, utilitaires
- Équilibre entre précision et flexibilité
- Base des abstractions réutilisables

## Exercices

1. Écris une fonction contrainte à `HasId & { name: string }`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function label<T extends { id: string; name: string }>(e: T): string {
     return `${e.id}: ${e.name}`;
   }
   ```
   :::

## Questions d'entretien

1. Comment combiner plusieurs contraintes sur un même paramètre de type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En utilisant une intersection : `T extends A & B`. T doit alors satisfaire à la fois A et B.
   :::
