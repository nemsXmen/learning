---
id: typescript-24-circular-dependencies
title: Circular dependencies
slug: circular-dependencies
technology: typescript
level: intermediate
module: 24-modules
order: 10
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-24-barrel-files]
skills: [modules]
tags: [typescript, modules]
---

## Objectifs

- Reconnaître les dépendances circulaires
- Comprendre leurs effets
- Les éviter ou les casser

## Introduction

Une **dépendance circulaire** existe quand A importe B et B importe A (directement ou via une chaîne).

## Concept

```ts
// a.ts
import { b } from "./b";
export const a = () => b();

// b.ts
import { a } from "./a";
export const b = () => a();
```

Effets possibles : `undefined` à l’init, bugs subtils, analyse plus difficile.

## Exemple – casser le cycle

- Extraire un module commun C
- Injecter des dépendances plutôt qu’importer
- Utiliser `import type` si seul un type est nécessaire



## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

À l’exécution, l’ordre d’évaluation des modules peut laisser des bindings partiellement initialisés.

## Erreurs fréquentes

- Cycles cachés via barrels
- Ignorer les warnings d’outils (madge, eslint-plugin-import)

## À retenir

- Cycles = odeur de design
- Extraire / inverser les dépendances
- `import type` pour les cycles purement type-level

## Exercices

1. Propose une façon de casser un cycle A ↔ B où seul un type est partagé.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Utiliser `import type` dans un sens, ou extraire le type dans un module `types.ts` importé par les deux.
   :::

## Questions d'entretien

1. Comment gères-tu les dépendances circulaires entre modules ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Je les détecte (outils), je les traite comme un signal de design : extraire un module commun, inverser une dépendance, ou passer en `import type` si seul le type est requis. L’objectif est un graphe de modules acyclique autant que possible.
   :::
