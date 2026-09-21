---
id: typescript-13-extends
title: extends
slug: extends
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-13-generic-constraints]
skills: [generics]
tags: [typescript, generics, extends]
---

## Objectifs

- Approfondir `extends` dans les contraintes
- Voir des contraintes plus riches
- Combiner avec des unions et des interfaces

## Introduction

`extends` est le mot-clé central des contraintes génériques.

## Concept

```ts
interface HasName {
  name: string;
}

function greet<T extends HasName>(entity: T): string {
  return `Hello, ${entity.name}`;
}
```

Contrainte sur une union :

```ts
function process<T extends string | number>(value: T): T {
  return value;
}
```

## Exemple

```ts
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}
```

## Comment ça fonctionne

`T extends X` exige que `T` soit assignable à `X`. On peut ensuite utiliser `T` comme un `X` (et plus précisément, comme le type concret fourni).

## Erreurs fréquentes

- Confondre `extends` de contrainte avec `extends` d’interface/classe
- Contraintes circulaires ou trop complexes

## À retenir

- `extends` = contrainte d’assignabilité
- Fonctionne avec interfaces, types, unions
- Base de presque tous les generics non triviaux

## Exercices

1. Constrain `T` à `string | number` dans une fonction qui retourne `String(value)`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function toStr<T extends string | number>(value: T): string {
     return String(value);
   }
   ```
   :::

## Questions d'entretien

1. Que signifie `T extends Foo` dans une déclaration générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Que le type concret fourni pour `T` doit être assignable à `Foo`. Cela autorise l’utilisation des membres de `Foo` sur les valeurs de type `T`.
   :::
