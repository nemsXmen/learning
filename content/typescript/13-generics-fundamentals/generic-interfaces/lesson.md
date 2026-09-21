---
id: typescript-13-generic-interfaces
title: Generic interfaces
slug: generic-interfaces
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-13-generics-avec-objets]
skills: [generics]
tags: [typescript, generics, interfaces]
---

## Objectifs

- Déclarer des interfaces génériques
- Les implémenter et les utiliser
- Voir des exemples (Repository, Factory…)

## Introduction

Les interfaces peuvent aussi être paramétrées par des types.

## Concept

```ts
interface Repository<T> {
  getById(id: string): T | undefined;
  save(entity: T): void;
  getAll(): T[];
}

interface User {
  id: string;
  name: string;
}

const userRepo: Repository<User> = {
  getById: (id) => undefined,
  save: (user) => {},
  getAll: () => []
};
```

## Exemple

```ts
interface KeyValuePair<K, V> {
  key: K;
  value: V;
}
```

## Comment ça fonctionne

`interface Nom<T> { ... }` crée un contrat paramétré. On fixe `T` à l’usage.

## Erreurs fréquentes

- Oublier de fixer le paramètre à l’usage
- Mélanger plusieurs paramètres sans les nommer clairement

## À retenir

- `interface Foo<T> { ... }`
- Très utile pour les repositories, factories, containers
- Même idée que les type aliases génériques pour les objets

## Exercices

1. Déclare une interface `Box<T>` avec `value: T` et `getValue(): T`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   interface Box<T> {
     value: T;
     getValue(): T;
   }
   ```
   :::

## Questions d'entretien

1. Comment déclare-t-on une interface générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec la syntaxe `interface Nom<T> { ... }`. Le paramètre de type peut être utilisé dans les propriétés et méthodes de l’interface.
   :::
