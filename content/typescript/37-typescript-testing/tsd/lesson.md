---
id: typescript-37-tsd
title: tsd
slug: tsd
technology: typescript
level: advanced
module: 37-typescript-testing
order: 11
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-37-type-level-tests]
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Utiliser tsd pour tester des types
- expectType / expectError
- Cas d’usage libs

## Introduction

**tsd** exécute des assertions de types sur des fichiers `.test-d.ts`.

## Concept

```ts
import { expectType, expectError } from "tsd";
import { add } from "./math";

expectType<number>(add(1, 2));
expectError(add("a", 2));
```

## Exemple

Idéal pour les bibliothèques qui exportent des APIs de types riches.

## Comment ça fonctionne

tsd compile les tests de types et rapporte les écarts. Intégrable npm scripts / CI.

## Erreurs fréquentes

- Mélanger tests runtime et tsd sans distinction
- expectError trop large

## À retenir

- .test-d.ts
- expectType / expectError
- Libs & utilitaires

## Exercices

1. À quoi sert expectError dans tsd ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   À vérifier qu’un certain usage produit bien une erreur de type.
   :::

## Questions d'entretien

1. Quand utiliser tsd ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Quand on publie ou maintient une API de types (lib, helpers génériques) et qu’on veut des assertions claires `expectType` / `expectError` en CI.
   :::
