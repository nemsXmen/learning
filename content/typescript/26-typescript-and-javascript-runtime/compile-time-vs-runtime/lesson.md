---
id: typescript-26-compile-time-vs-runtime
title: Compile-time vs runtime
slug: compile-time-vs-runtime
technology: typescript
level: intermediate
module: 26-typescript-and-javascript-runtime
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [runtime]
tags: [typescript, runtime]
---

## Objectifs

- Distinguer compile-time et runtime
- Comprendre ce que TypeScript garantit (et ne garantit pas)
- Poser les bases de la validation runtime

## Introduction

TypeScript opère à la **compilation**. JavaScript s’exécute au **runtime**. Les deux mondes ne se confondent pas.

## Concept

| Compile-time (TS) | Runtime (JS) |
|-------------------|--------------|
| Types, interfaces | Valeurs réelles |
| Erreurs de typage | Exceptions, bugs |
| Effacés à l’émission | Exécutés |

```ts
const n: number = 1; // check compile-time
// JS émis : const n = 1;
```

## Exemple

Une assertion `as User` passe à la compile mais ne vérifie rien quand le JSON arrive du réseau.

## Comment ça fonctionne

Le compilateur analyse et efface les types. Le moteur JS ne voit que le code émis.

## Erreurs fréquentes

- Croire que les types protègent des données externes
- Confondre erreur TS et exception runtime

## À retenir

- TS = compile-time
- JS = runtime
- Les types n’existent plus à l’exécution

## Exercices

1. Explique en une phrase ce qui reste d’une interface à runtime.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Rien : les interfaces sont entièrement effacées.
   :::

## Questions d'entretien

1. TypeScript garantit-il la forme des données à runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non. Il garantit la cohérence des types au moment de la compilation. À runtime, seules des validations JavaScript explicites peuvent vérifier les données.
   :::
