---
id: typescript-12-const-enum
title: const enum
slug: const-enum
technology: typescript
level: intermediate
module: 12-enums
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-12-string-enums]
skills: [enums]
tags: [typescript, enums, const-enum]
---

## Objectifs

- Comprendre les `const enum`
- Voir qu’ils sont inlinés à la compilation
- Connaître leurs limites

## Introduction

Un **`const enum`** est complètement effacé à la compilation : les usages sont remplacés par les valeurs littérales.

## Concept

```ts
const enum Direction {
  Up,
  Down,
  Left,
  Right
}

let dir = Direction.Up;
// compilé en : let dir = 0;
```

Aucun objet `Direction` n’existe dans le JavaScript généré.

## Exemple

```ts
const enum Http {
  OK = 200,
  NotFound = 404
}

fetch(url).then(r => {
  if (r.status === Http.OK) { /* ... */ }
});
// → if (r.status === 200)
```

## Comment ça fonctionne

Le compilateur inline les valeurs. Cela réduit la taille du bundle mais impose des contraintes (pas d’accès dynamique, isolationModules, etc.).

## Erreurs fréquentes

- Utiliser un const enum avec des imports type-only / isolationModules sans précaution
- S’attendre à un objet runtime

## À retenir

- `const enum` = inlining, pas d’objet runtime
- Plus léger, mais moins flexible
- Attention aux options de compilation modernes

## Exercices

1. Déclare un const enum `Color` avec Red, Green, Blue.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   const enum Color {
     Red,
     Green,
     Blue
   }
   ```
   :::

## Questions d'entretien


1. Quelle est la différence entre `enum` et `const enum` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Un enum classique génère un objet JavaScript à runtime. Un const enum est entièrement inliné : les références sont remplacées par les valeurs littérales et aucun objet n’est émis.
   :::

