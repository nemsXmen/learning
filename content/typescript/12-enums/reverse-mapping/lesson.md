---
id: typescript-12-reverse-mapping
title: Reverse mapping
slug: reverse-mapping
technology: typescript
level: intermediate
module: 12-enums
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-12-runtime-des-enums]
skills: [enums]
tags: [typescript, enums]
---

## Objectifs

- Comprendre le reverse mapping des numeric enums
- L’utiliser et connaître ses pièges
- Savoir qu’il n’existe pas pour les string enums

## Introduction

Les numeric enums mappent à la fois nom → valeur et valeur → nom.

## Concept

```ts
enum Direction {
  Up = 0,
  Down = 1
}

Direction.Up;   // 0
Direction[0];   // "Up"
Direction[1];   // "Down"
```

Le reverse mapping est généré automatiquement pour les membres numériques.

## Exemple

```ts
function getName(value: number): string | undefined {
  return Direction[value];
}
```

## Comment ça fonctionne

L’objet runtime contient les deux directions. Les string enums n’ont pas ce comportement.

## Erreurs fréquentes

- S’appuyer sur le reverse mapping avec des string enums
- Confondre les clés string et number de l’objet

## À retenir

- Numeric enum → reverse mapping
- String enum → pas de reverse mapping
- Utile pour debug / affichage, à utiliser avec prudence

## Exercices

1. Affiche le nom d’un membre à partir de sa valeur numérique.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   enum Status { Idle, Active }
   console.log(Status[0]); // "Idle"
   ```
   :::

## Questions d'entretien


1. Qu’est-ce que le reverse mapping d’un enum ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Pour les numeric enums, l’objet runtime mappe aussi les valeurs numériques vers les noms de membres (`Direction[0] === "Up"`). Les string enums n’ont pas ce reverse mapping.
   :::

