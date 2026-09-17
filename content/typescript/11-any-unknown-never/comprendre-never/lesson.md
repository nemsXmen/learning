---
id: typescript-11-comprendre-never
title: Comprendre never
slug: comprendre-never
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-05-never]
skills: [any-unknown-never]
tags: [typescript, never]
---

## Objectifs

- Comprendre le type `never`
- Voir qu’il représente l’absence de valeur possible
- Connaître ses rôles (retour, exhaustivité, bottom type)

## Introduction

`never` est le type de ce qui n’arrive jamais. C’est le **bottom type** : aucun type n’est plus bas.

## Concept

```ts
function fail(message: string): never {
  throw new Error(message);
}

function infinite(): never {
  while (true) {}
}
```

`never` n’a aucune valeur possible. Une expression de type `never` ne retourne pas (throw ou boucle infinie).

## Exemple

Dans les unions, `never` disparaît :

```ts
type T = string | never; // string
```

## Comment ça fonctionne

`never` est assignable à tous les types (bottom type), mais seul `never` lui est assignable. Il sert surtout à typer les fonctions qui ne terminent pas et à l’exhaustivité.

## Erreurs fréquentes

- Confondre `never` et `void`
- Utiliser `never` pour « pas encore implémenté » (préférer `TODO` + erreur)

## À retenir

- `never` = n’arrive jamais
- Bottom type
- Outil clé pour l’exhaustivité

## Exercices

1. Déclare une fonction qui throw toujours et est typée `never`.

   :::solution
   ```ts
   function panic(msg: string): never {
     throw new Error(msg);
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce que le type `never` ?

   :::reponse
   C’est le bottom type : il représente des valeurs qui n’existent pas. On l’utilise pour les fonctions qui ne retournent jamais (throw, boucle infinie) et pour vérifier l’exhaustivité des unions.
   :::
