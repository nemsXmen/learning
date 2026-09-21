---
id: typescript-03-tableaux-complexes
title: Tableaux complexes
slug: tableaux-complexes
technology: typescript
level: beginner
module: 03-arrays-and-tuples
order: 4
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-03-array-generic]
skills: [arrays-tuples]
tags: [typescript, arrays]
---

## Objectifs

- Typer des tableaux d’objets
- Utiliser des unions dans les tableaux
- Comprendre les tableaux de types mixtes contrôlés

## Introduction

Dès qu’on sort des primitifs, on a besoin de tableaux plus expressifs.

## Concept

### Tableau d’objets

```ts
interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];
```

### Union de types

```ts
const mixed: (string | number)[] = ["hello", 42, "world"];
```

### Tableau de tableaux (voir leçon suivante)

## Exemple

```ts
function getNames(users: User[]): string[] {
  return users.map(u => u.name);
}
```

## Comment ça fonctionne

Le type de l’élément peut être n’importe quel type TypeScript valide : interface, union, intersection, type alias, etc.

## Erreurs fréquentes

- Oublier les parenthèses dans `(string | number)[]` → `string | number[]` (priorité différente)
- Mettre des objets littéraux qui ne respectent pas l’interface (excess property checking)

## À retenir

- `T[]` fonctionne avec n’importe quel T
- Attention à la priorité : `(A | B)[]` vs `A | B[]`
- Les tableaux d’interfaces sont extrêmement courants

## Exercices

1. Déclare un tableau d’objets `{ title: string; done: boolean }`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   interface Task {
     title: string;
     done: boolean;
   }
   const tasks: Task[] = [
     { title: "Apprendre TS", done: false }
   ];
   ```
   :::

## Questions d'entretien


1. Quelle est la différence entre `(string | number)[]` et `string | number[]` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   `(string | number)[]` est un tableau dont chaque élément est string ou number.  
   `string | number[]` est soit une string, soit un tableau de numbers. Les parenthèses changent tout.
   :::

