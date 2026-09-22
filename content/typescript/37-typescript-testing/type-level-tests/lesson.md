---
id: typescript-37-type-level-tests
title: Type-level tests
slug: type-level-tests
technology: typescript
level: advanced
module: 37-typescript-testing
order: 10
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-37-tests-de-generic-typescript-basics]
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Écrire des assertions de types
- Equal / Extends helpers
- Intégrer à la CI via tsc

## Introduction

Les **type-level tests** sont des fichiers TS qui doivent compiler (ou échouer) selon des assertions.

## Concept

```ts
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;

type Expect<T extends true> = T;

type _cases = [
  Expect<Equal<ReturnType<typeof add>, number>>,
  Expect<Equal<Parameters<typeof add>[0], number>>
];
```

## Exemple

Libs : `expect-type`, helpers de type-challenges.

## Comment ça fonctionne

Si un type ne match plus, `tsc` échoue → test rouge au niveau types.

## Erreurs fréquentes

- Helpers Equal incorrects
- Trop de couplage aux types internes

## À retenir

- Expect\<Equal\<...\>\>
- Fichiers dédiés
- CI tsc

## Exercices

1. À quoi sert Expect\<T extends true\> ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   À forcer une erreur de compile si T n’est pas true (assertion de type).
   :::

## Questions d'entretien

1. Comment automatises-tu les type-level tests ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En commitant des fichiers d’assertions de types et en faisant tourner `tsc --noEmit` (ou tsd) en CI. Toute régression de type casse le build.
   :::
