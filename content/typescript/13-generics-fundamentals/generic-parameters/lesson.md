---
id: typescript-13-generic-parameters
title: Generic parameters
slug: generic-parameters
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-13-generic-typescript-basics]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Nommer et utiliser des paramètres de type
- Connaître les conventions de nommage
- Voir la portée des paramètres

## Introduction

Un **paramètre de type** (type parameter) est un placeholder pour un type réel.

## Concept

```ts
function map<T, U>(items: T[], fn: (item: T) => U): U[] {
  return items.map(fn);
}
```

Conventions courantes :
- `T`, `U`, `V` pour des types libres
- `K` pour une clé (key)
- `TItem`, `TResult` pour plus de clarté

## Exemple

```ts
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## Comment ça fonctionne

Le paramètre de type est visible dans toute la signature (et le corps) de la fonction / interface / type. Il est « lié » à chaque appel.

## Erreurs fréquentes

- Réutiliser le même nom de paramètre dans des scopes qui se chevauchent de façon confuse
- Noms trop cryptiques dans des APIs publiques

## À retenir

- `T`, `U`, `K`… = paramètres de type
- Portée = signature + corps
- Noms clairs pour les APIs publiques

## Exercices

1. Écris une fonction `wrap<T>` qui retourne `{ value: T }`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function wrap<T>(value: T): { value: T } {
     return { value };
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la portée d’un paramètre de type dans une fonction générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il est visible dans toute la signature (paramètres, type de retour) et dans le corps de la fonction. Sa valeur concrète est fixée à chaque appel.
   :::
