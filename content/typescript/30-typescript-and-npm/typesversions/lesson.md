---
id: typescript-30-typesversions
title: typesVersions
slug: typesversions
technology: typescript
level: advanced
module: 30-typescript-and-npm
order: 8
estimatedMinutes: 10
difficulty: 3
xp: 45
prerequisites: [typescript-30-exports]
skills: [npm]
tags: [typescript, npm]
---

## Objectifs

- Comprendre `typesVersions`
- Servir des types selon la version de TypeScript
- Savoir quand s’en passer

## Introduction

`typesVersions` mappe des versions de TypeScript vers des chemins de types alternatifs.

## Concept

```json
{
  "types": "./index.d.ts",
  "typesVersions": {
    "<=4.9": { "*": ["ts4.9/*"] },
    "*": { "*": ["ts5/*"] }
  }
}
```

## Exemple

Utile pour supporter d’anciennes versions de TS avec des syntaxes de types différentes (rare pour les libs nouvelles).

## Comment ça fonctionne

TypeScript choisit la branche compatible avec sa version.

## Erreurs fréquentes

- Complexifier trop tôt
- Chemins typesVersions cassés

## À retenir

- Support multi-versions TS
- Cas avancé
- Préférer une seule ligne de types si possible

## Exercices

1. À quoi sert typesVersions en une phrase ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   À fournir des déclarations différentes selon la version de TypeScript du consommateur.
   :::

## Questions d'entretien

1. Quand utiliserais-tu `typesVersions` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour maintenir la compatibilité de types avec plusieurs versions majeures de TypeScript lorsque la syntaxe ou les features de types divergent — en acceptant la complexité de maintenance.
   :::
