---
id: typescript-24-import-type
title: import type
slug: import-type
technology: typescript
level: intermediate
module: 24-modules
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-24-export-type]
skills: [modules]
tags: [typescript, modules]
---

## Objectifs

- Utiliser `import type`
- Importer uniquement des types
- Éviter les dépendances runtime inutiles

## Introduction

`import type` importe **uniquement** des types (effacés à la compile).

## Concept

```ts
import type { User } from "./user";
import type { Request, Response } from "express";

function printUser(u: User) {
  console.log(u.name);
}
```

Forme inline :

```ts
import { type User, createUser } from "./user";
```

## Exemple

Utile pour les types seulement, sans tirer le module au runtime (selon le bundler / verbatimModuleSyntax).

## Comment ça fonctionne

TypeScript efface ces imports. Avec `verbatimModuleSyntax` / certaines configs, les imports de types non marqués peuvent être signalés.

## Erreurs fréquentes

- `import type` puis utiliser le symbole comme valeur

## À retenir

- `import type { ... }`
- Pas de binding runtime
- Bonne pratique avec isolatedModules

## Exercices

1. Importe le type `Config` depuis `./config` en type-only.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   import type { Config } from "./config";
   ```
   :::

## Questions d'entretien

1. Quel intérêt de `import type` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Garantir que l’import est purement type-level : pas de dépendance runtime, clarté pour les outils et compatibilité avec isolatedModules / verbatimModuleSyntax.
   :::
