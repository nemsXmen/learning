---
id: typescript-11-void-vs-never
title: void vs never
slug: void-vs-never
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-11-comprendre-never, typescript-05-void]
skills: [any-unknown-never]
tags: [typescript, void, never]
---

## Objectifs

- Distinguer clairement `void` et `never`
- Choisir le bon type de retour
- Éviter les confusions courantes

## Introduction

`void` et `never` sont souvent mélangés, mais leurs sémantiques sont opposées.

## Concept

|                | void                              | never                                |
|----------------|-----------------------------------|--------------------------------------|
| Signification  | Pas de valeur utile retournée     | Ne retourne jamais                   |
| Terminaison    | Oui (fin normale de fonction)     | Non (throw / boucle)                 |
| Usage typique  | Callbacks, loggers, setters       | fail(), assertNever, boucles infinies|

```ts
function log(msg: string): void {
  console.log(msg);
}

function fail(msg: string): never {
  throw new Error(msg);
}
```

## Exemple

```ts
// void : on peut ignorer le retour
const r: void = log("hello");

// never : pas de suite possible
fail("boom");
console.log("inatteignable");
```

## Comment ça fonctionne

`void` signifie « l’appelant ne doit pas utiliser de valeur de retour ».  
`never` signifie « l’appelant ne recevra jamais de retour car la fonction ne termine pas ».

## Erreurs fréquentes

- Annoter `: never` une fonction qui retourne implicitement undefined
- Annoter `: void` une fonction qui throw toujours

## À retenir

- `void` = pas de valeur utile
- `never` = pas de retour du tout
- Choisir selon la sémantique réelle

## Exercices

1. Pour chaque fonction, choisis void ou never : logger, throw Error, boucle infinie, setter.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   logger → void ; throw → never ; boucle → never ; setter → void
   :::

## Questions d'entretien


1. Quelle est la différence entre une fonction `: void` et une fonction `: never` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   `void` : la fonction se termine mais ne produit pas de valeur utile pour l’appelant. `never` : la fonction ne se termine jamais normalement (exception ou boucle infinie), donc aucun code après l’appel n’est atteignable.
   :::

