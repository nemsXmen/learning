---
id: typescript-24-export-type
title: export type
slug: export-type
technology: typescript
level: intermediate
module: 24-modules
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-24-re-exports]
skills: [modules]
tags: [typescript, modules]
---

## Objectifs

- Utiliser `export type`
- Garantir un export purement type-level
- Éviter les imports de valeurs accidentels

## Introduction

`export type` marque un export comme **type-only**.

## Concept

```ts
export type User = { id: string; name: string };
export type ID = string;

// ou
type User = { id: string; name: string };
export type { User };
```

## Exemple

Avec `isolatedModules` / bundlers, distinguer type et valeur évite des erreurs d’émission.

## Comment ça fonctionne

Les exports type sont effacés à la compilation. Ils ne créent pas de binding runtime.

## Erreurs fréquentes

- Exporter une classe avec `export type` puis l’utiliser comme valeur

## À retenir

- `export type` = type only
- Compatible isolatedModules
- Clarté de l’intention

## Exercices

1. Exporte un type `Point` avec export type.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export type Point = { x: number; y: number };
   ```
   :::

## Questions d'entretien

1. Pourquoi utiliser `export type` plutôt que `export` pour un type alias ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour marquer explicitement que l’export est purement type-level, ce qui aide les outils (`isolatedModules`, bundlers) et documente l’intention : aucune valeur runtime n’est exportée.
   :::
