---
id: typescript-12-runtime-des-enums
title: Runtime des enums
slug: runtime-des-enums
technology: typescript
level: intermediate
module: 12-enums
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-12-membres-d-enum]
skills: [enums]
tags: [typescript, enums, runtime]
---

## Objectifs

- Voir ce que génère le compilateur pour un enum
- Comprendre l’objet runtime
- Distinguer enum classique et const enum

## Introduction

Contrairement à la plupart des types TypeScript, les enums (non const) existent à runtime.

## Concept

```ts
enum Direction {
  Up,
  Down
}
```

JavaScript approximatif généré :

```js
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  Direction[Direction["Down"] = 1] = "Down";
})(Direction || (Direction = {}));
```

On obtient un objet avec mapping dans les deux sens (numeric enums).

## Exemple

```ts
console.log(Direction.Up);    // 0
console.log(Direction[0]);    // "Up" (reverse mapping)
```

## Comment ça fonctionne

Le compilateur émet une IIFE qui construit l’objet. Les const enums n’émettent rien (inlining).

## Erreurs fréquentes

- S’attendre à ce que tous les types TS existent à runtime
- Utiliser le reverse mapping sans le comprendre

## À retenir

- Enum classique → objet JS
- Const enum → pas d’objet
- Numeric enums : reverse mapping

## Exercices

1. Explique ce que contient l’objet runtime d’un numeric enum simple à 2 membres.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   Des propriétés nom → valeur (Up: 0) et valeur → nom (0: "Up") grâce au reverse mapping.
   :::

## Questions d'entretien


1. Les enums TypeScript existent-ils à runtime ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Les enums classiques oui : le compilateur génère un objet JavaScript. Les const enums non : leurs valeurs sont inlinées et aucun objet n’est émis.
   :::

