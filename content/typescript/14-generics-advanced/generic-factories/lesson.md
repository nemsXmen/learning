---
id: typescript-14-generic-factories
title: Generic factories
slug: generic-factories
technology: typescript
level: intermediate
module: 14-generics-advanced
order: 4
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-14-indexed-access-types]
skills: [generics]
tags: [typescript, generics, factories]
---

## Objectifs

- Créer des factories génériques
- Typer la création d’objets
- Voir des patterns de configuration

## Introduction

Une **factory** générique produit des instances tout en préservant les types.

## Concept

```ts
function createPair<T, U>(first: T, second: U): { first: T; second: U } {
  return { first, second };
}

const p = createPair("id", 42); // { first: string; second: number }
```

Factory avec contraintes :

```ts
function createEntity<T extends { id: string }>(
  data: Omit<T, "id"> & { id?: string }
): T {
  return {
    ...data,
    id: data.id ?? crypto.randomUUID()
  } as T;
}
```

## Exemple

```ts
type Factory<T> = (...args: any[]) => T;

function register<T>(name: string, factory: Factory<T>) {
  // ...
}
```

## Comment ça fonctionne

Le generic propage le type de la valeur créée. Les contraintes et utilitaires (`Omit`, `Partial`…) affinent les entrées.

## Erreurs fréquentes

- Casts excessifs dans la factory
- Perdre le type en repassant par `any`

## À retenir

- Factory générique = création typée
- Combinable avec Omit / Partial / contraintes
- Très utile pour les entités et configs

## Exercices

1. Écris une factory `createBox<T>(value: T)` qui retourne `{ value: T }`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function createBox<T>(value: T): { value: T } {
     return { value };
   }
   ```
   :::

## Questions d'entretien

1. Quel intérêt d’une factory générique par rapport à une factory non typée ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Elle préserve le type de l’objet créé, offre de l’autocomplétion et détecte les erreurs à la compilation, au lieu de retourner `any` ou un type trop large.
   :::
