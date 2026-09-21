---
id: typescript-05-compatibilite-des-fonctions
title: Compatibilité des fonctions
slug: compatibilite-des-fonctions
technology: typescript
level: intermediate
module: 05-functions
order: 15
estimatedMinutes: 20
difficulty: 3
xp: 60
prerequisites: [typescript-05-function-types]
skills: [functions]
tags: [typescript, functions, compatibility]
---

## Objectifs

- Comprendre la compatibilité des types de fonctions
- Voir la notion de bivariance des paramètres (et les options strictes)
- Savoir ce qui est assignable ou non

## Introduction

TypeScript a des règles spécifiques pour décider si une fonction peut être assignée à une variable d’un autre type de fonction.

## Concept

### Retour

Le type de retour doit être compatible (covariant) :

```ts
type ReturnsNumber = () => number;
const f: ReturnsNumber = () => 42; // OK
// const g: ReturnsNumber = () => "hello"; // ❌
```

### Paramètres

Avec `strictFunctionTypes` (recommandé), les paramètres sont **contravariants** : la fonction source doit accepter au moins ce que la cible attend.

```ts
type Handler = (event: MouseEvent) => void;
const h: Handler = (e: Event) => {}; // OK – Event est plus large
// const h2: Handler = (e: MouseEvent & { x: number }) => {}; // ❌ trop spécifique
```

## Exemple

```ts
type Logger = (message: string) => void;
const log: Logger = (msg) => console.log(msg);
const logAny: Logger = (msg: any) => console.log(msg); // OK
```

## Comment ça fonctionne

TypeScript vérifie la compatibilité paramètre par paramètre et sur le retour. Le mode `strictFunctionTypes` rend les paramètres strictement contravariants pour plus de sécurité.

## Erreurs fréquentes

- S’étonner qu’une fonction avec moins de paramètres soit assignable (c’est autorisé)
- Désactiver `strictFunctionTypes` sans comprendre les implications

## À retenir

- Retour : covariant (doit être compatible)
- Paramètres : contravariants sous strictFunctionTypes
- Une fonction peut avoir moins de paramètres que le type cible
- Active `strictFunctionTypes` pour plus de sûreté

## Exercices

1. Explique pourquoi `const f: (x: string) => void = (x: string | number) => {}` est valide.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   Le paramètre de la source (`string | number`) est plus large que `string`. En contravariance, c’est acceptable : la fonction peut gérer tout ce que l’appelant lui passera.
   :::

## Questions d'entretien


1. Que signifie la contravariance des paramètres de fonctions en TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Une fonction source est assignable à un type cible si ses paramètres sont plus larges (ou égaux) que ceux de la cible. Ainsi elle peut accepter tout argument que l’appelant pourrait fournir. C’est le comportement activé par `strictFunctionTypes`.
   :::

