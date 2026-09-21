---
id: typescript-02-annotations-explicites
title: Annotations explicites
slug: annotations-explicites
technology: typescript
level: beginner
module: 02-types-primitifs
order: 13
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-02-inference-des-types-primitifs]
skills: [primitive-types]
tags: [typescript, annotations, primitifs]
---

## Objectifs

- Savoir quand forcer une annotation explicite sur un primitif
- Éviter la sur-annotation
- Gérer les cas où l’inférence n’est pas suffisante

## Introduction

Même si l’inférence est excellente, il y a des situations où une annotation explicite est nécessaire ou souhaitable.

## Concept

Cas où l’annotation explicite est utile :

1. Variable déclarée sans valeur initiale
2. Valeur qui pourrait être interprétée trop largement
3. API publique (paramètres et retours)
4. Intention de restreindre le type (literal)

```ts
let count: number; // obligatoire si pas d’initialisation
count = 10;

let status: "on" | "off" = "on"; // restriction volontaire
```

## Exemple

```ts
// Sans annotation, inféré comme string
let id = "abc123";

// Avec annotation plus stricte si besoin
let userId: string = "abc123";
```

Pour les paramètres de fonction, l’annotation est presque toujours nécessaire (sauf avec contextual typing).

## Comment ça fonctionne

L’annotation explicite force TypeScript à vérifier la compatibilité. Elle sert aussi de documentation.

## Erreurs fréquentes

- Annoter toutes les variables locales évidentes (`let x: number = 5`)
- Oublier d’annoter les paramètres de fonctions publiques

## À retenir

- Annoter les frontières et les cas ambigus
- Laisser l’inférence partout ailleurs
- Les annotations sont aussi de la documentation

## Exercices

1. Annoter correctement une variable qui sera assignée plus tard.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   let total: number;
   total = calculate();
   ```
   :::

## Questions d'entretien


1. Dans quels cas annotes-tu explicitement un type primitif plutôt que de laisser l’inférence ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Quand la variable n’est pas initialisée immédiatement, quand je veux restreindre à un literal type, et systématiquement pour les paramètres et retours des API publiques.
   :::

