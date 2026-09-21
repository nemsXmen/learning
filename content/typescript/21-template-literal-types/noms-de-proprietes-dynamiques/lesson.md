---
id: typescript-21-noms-de-proprietes-dynamiques
title: Noms de propriétés dynamiques
slug: noms-de-proprietes-dynamiques
technology: typescript
level: advanced
module: 21-template-literal-types
order: 3
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-21-string-unions-dynamiques]
skills: [template-literal-types]
tags: [typescript, template-literal-types]
---

## Objectifs

- Combiner template literals et key remapping
- Générer des noms de propriétés
- Typer des getters / setters / handlers

## Introduction

Avec `as` dans un mapped type, on génère des noms de props dynamiques.

## Concept

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type Person = { name: string; age: number };
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
```

## Exemple

```ts
type WithPrefix<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};
```

## Comment ça fonctionne

Le template produit le nouveau nom de clé ; le mapped type crée la propriété.

## Erreurs fréquentes

- Oublier `string & K` pour Capitalize

## À retenir

- Template + key remapping
- getX / setX / onX
- APIs d’objets cohérentes

## Exercices

1. Génère des props `setName` / `setAge` pour Person.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Setters<T> = {
     [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
   };
   ```
   :::

## Questions d'entretien

1. Comment génères-tu des noms de propriétés comme getName à partir d’un type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un mapped type et key remapping : `[K in keyof T as \`get${Capitalize<string & K>}\`]`.
   :::
