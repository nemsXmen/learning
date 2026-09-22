---
id: typescript-14-higher-order-generics
title: Higher-order generics
slug: higher-order-generics
technology: typescript
level: advanced
module: 14-generics-advanced
order: 11
estimatedMinutes: 15
difficulty: 3
xp: 60
prerequisites: [typescript-14-recursive-generics]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Comprendre les generics d’ordre supérieur (types qui prennent des types génériques)
- Voir des patterns avancés
- Connaître les limites

## Introduction

Un **higher-order generic** est un type ou une fonction qui abstrait sur un autre type générique.

## Concept

```ts
type TypeConstructor = { new (...args: any[]): any };

function createInstance<T extends TypeConstructor>(
  Ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Ctor(...args);
}
```

```ts
// Type qui transforme un autre type
type MaybeAsync<T> = T | Promise<T>;
type Arrayify<T> = T[];
```

## Exemple

```ts
type MapResult<F extends (...args: any) => any> = ReturnType<F>;
```

## Comment ça fonctionne

On utilise des contraintes sur des signatures de fonctions ou de constructeurs, et des utilitaires comme `ReturnType`, `InstanceType`, `ConstructorParameters`.

## Erreurs fréquentes

- Complexité excessive difficile à maintenir
- Inférence qui échoue sur des cas trop abstraits

## À retenir

- Higher-order = abstraire sur des types/fonctions génériques
- Utilitaires TS (ReturnType, InstanceType…) sont centraux
- À utiliser avec parcimonie

## Exercices

1. Utilise `ReturnType` pour extraire le type de retour d’une fonction générique simple.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function identity<T>(x: T): T { return x; }
   type R = ReturnType<typeof identity<string>>; // string
   ```
   :::

## Questions d'entretien

1. Qu’entend-on par higher-order generics en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Des types ou fonctions qui abstraitent sur d’autres types génériques ou sur des constructeurs/fonctions, souvent via des contraintes sur des signatures et des utilitaires comme ReturnType ou InstanceType.
   :::
