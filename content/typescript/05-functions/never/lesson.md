---
id: typescript-05-never
title: never
slug: never
technology: typescript
level: beginner
module: 05-functions
order: 13
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-02-never, typescript-05-void]
skills: [functions]
tags: [typescript, functions, never]
---

## Objectifs

- Utiliser `never` comme type de retour
- Comprendre les fonctions qui ne retournent jamais
- L’utiliser pour l’exhaustivité

## Introduction

`never` signifie que la fonction ne se termine jamais normalement (throw ou boucle infinie).

## Concept

```ts
function fail(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

## Exemple – exhaustiveness

```ts
function assertNever(x: never): never {
  throw new Error("Unexpected: " + x);
}

type Shape = "circle" | "square";
function area(shape: Shape): number {
  switch (shape) {
    case "circle": return 1;
    case "square": return 1;
    default: return assertNever(shape);
  }
}
```

## Comment ça fonctionne

`never` est le type bottom. Une fonction `never` n’a pas de chemin de retour normal.

## Erreurs fréquentes

- Utiliser `never` à la place de `void`
- Oublier le pattern `assertNever` pour les unions

## À retenir

- `never` = ne retourne jamais
- Utile pour les erreurs fatales et l’exhaustivité
- Différent de `void`

## Exercices

1. Écris une fonction `raise` qui throw toujours et est typée `never`.

   :::solution
   ```ts
   function raise(msg: string): never {
     throw new Error(msg);
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre une fonction qui retourne `void` et une qui retourne `never` ?

   :::reponse
   `void` signifie « pas de valeur utile » (la fonction se termine). `never` signifie que la fonction ne se termine jamais normalement (throw ou boucle infinie).
   :::
