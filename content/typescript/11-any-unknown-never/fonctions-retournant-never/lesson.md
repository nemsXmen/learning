---
id: typescript-11-fonctions-retournant-never
title: Fonctions retournant never
slug: fonctions-retournant-never
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-11-comprendre-never]
skills: [any-unknown-never]
tags: [typescript, never]
---

## Objectifs

- Typer correctement les fonctions qui ne retournent jamais
- Distinguer throw et boucle infinie
- Voir l’effet sur le control-flow

## Introduction

Une fonction `: never` indique qu’elle ne termine jamais normalement.

## Concept

```ts
function raise(message: string): never {
  throw new Error(message);
}

function runForever(): never {
  while (true) {
    // ...
  }
}
```

Après un appel à une fonction `never`, TypeScript sait que le code suivant est inatteignable :

```ts
function demo(x: string | null) {
  if (x === null) {
    raise("null not allowed");
  }
  // x est string ici
  return x.toUpperCase();
}
```

## Exemple

```ts
function assertUnreachable(x: never): never {
  throw new Error("Unreachable: " + x);
}
```

## Comment ça fonctionne

Le type de retour `never` informe le control-flow analysis que l’exécution ne continue pas après l’appel.

## Erreurs fréquentes

- Annoter `: never` une fonction qui peut retourner
- Confondre avec `: void`

## À retenir

- `: never` pour throw / boucle infinie
- Aide le narrowing dans le code appelant
- Base de `assertNever`

## Exercices

1. Utilise une fonction `never` pour éliminer le cas null.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function ensure<T>(value: T | null): T {
     if (value === null) raise("null");
     return value;
   }
   ```
   :::

## Questions d'entretien


1. Quel effet une fonction `: never` a-t-elle sur le code qui la suit ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   TypeScript considère que l’exécution ne continue pas après l’appel. Cela permet d’éliminer des cas (null, branches impossibles) et d’affiner les types dans la suite du flux.
   :::

