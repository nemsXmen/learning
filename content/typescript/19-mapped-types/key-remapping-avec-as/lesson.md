---
id: typescript-19-key-remapping-avec-as
title: Key remapping avec as
slug: key-remapping-avec-as
technology: typescript
level: advanced
module: 19-mapped-types
order: 5
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-19-modifier-readonly]
skills: [mapped-types]
tags: [typescript, mapped-types]
---

## Objectifs

- Utiliser le key remapping `as`
- Renommer ou filtrer des clés
- Combiner avec template literals

## Introduction

Depuis TypeScript 4.1, on peut **remapper** les clés dans un mapped type avec `as`.

## Concept

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type User = { name: string; age: number };
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }
```

Filtrer (exclure des clés) :

```ts
type OmitId<T> = {
  [K in keyof T as K extends "id" ? never : K]: T[K];
};
```

## Exemple

```ts
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]?: (value: T[K]) => void;
};
```

## Comment ça fonctionne

`as NewKey` remplace le nom de la clé. Si `NewKey` est `never`, la propriété est omise.

## Erreurs fréquentes

- Oublier `string & K` pour Capitalize (K peut être string | number | symbol)

## À retenir

- `[K in keyof T as NewKey]`
- `never` = filtre
- Template literals pour préfixer/suffixer

## Exercices

1. Préfixe toutes les clés de T avec `api_`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type ApiKeys<T> = {
     [K in keyof T as `api_${string & K}`]: T[K];
   };
   ```
   :::

## Questions d'entretien

1. À quoi sert le key remapping (`as`) dans un mapped type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À renommer les clés (souvent avec des template literals) ou à en filtrer certaines (en produisant `never`). C’est essentiel pour des patterns comme `onClick`, `getName`, etc.
   :::
