---
id: typescript-24-module-boundaries
title: Module boundaries
slug: module-boundaries
technology: typescript
level: intermediate
module: 24-modules
order: 11
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-24-circular-dependencies]
skills: [modules]
tags: [typescript, modules, architecture]
---

## Objectifs

- Définir des frontières de modules claires
- Appliquer des règles d’import (layers)
- Préparer monorepos / features

## Introduction

Les **frontières de modules** structurent l’architecture : qui peut importer quoi.

## Concept

Exemples de règles :
- `ui` n’importe pas `database`
- `domain` n’importe pas `react`
- Les features importent le `shared`, pas l’inverse

```ts
// Autorisé
import { Button } from "@ui/button";
import { User } from "@domain/user";

// Interdit (exemple de règle projet)
import { db } from "../../infra/db"; // depuis ui/
```

## Exemple

Outils : ESLint boundaries, Nx tags, dependency-cruiser, tsconfig project references.

## Comment ça fonctionne

On documente les couches et on automatise les contraintes pour éviter le spaghetti d’imports.

## Erreurs fréquentes

- Tout importer depuis tout le monde
- Barrels globaux qui cassent les frontières

## À retenir

- Frontières explicites
- Règles automatisées si possible
- API publique par package / feature

## Exercices

1. Propose une règle simple pour un dossier `domain/` et `ui/`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `ui` peut importer `domain`, mais `domain` n’importe jamais `ui`.
   :::

## Questions d'entretien

1. Comment fais-tu respecter les frontières de modules dans un projet TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En définissant des couches/packages clairs, en n’exportant que des APIs publiques, et en automatisant les règles (ESLint boundaries, Nx tags, project references) pour empêcher les imports interdits.
   :::
