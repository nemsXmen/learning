---
id: typescript-25-paths
title: paths
slug: paths
technology: typescript
level: intermediate
module: 25-tsconfig
order: 16
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-25-base-url]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Configurer `paths`
- Créer des alias d’import
- Les synchroniser avec le bundler

## Introduction

`paths` mappe des préfixes d’import vers des chemins réels (relatifs à `baseUrl`).

## Concept

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

```ts
import { Button } from "@components/Button";
```

## Exemple

Très courant dans les apps React/Next/Vite (alias `@/`).

## Comment ça fonctionne

TypeScript résout l’alias au type-checking. Le **bundler** (ou tsc-alias, etc.) doit appliquer le même mapping au runtime/build.

## Erreurs fréquentes

- paths TS sans config équivalente Vite/Webpack
- Alias trop nombreux et confus

## À retenir

- Alias = lisibilité
- baseUrl + paths
- Sync obligatoire avec le tool de build

## Exercices

1. Mappe `@lib/*` vers `src/lib/*`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": { "@lib/*": ["src/lib/*"] }
     }
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi les `paths` TypeScript ne suffisent-ils pas seuls au runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce qu’ils n’affectent que le type-checking. Le runtime ou le bundler doit aussi résoudre les alias, via sa propre config (Vite resolve.alias, webpack alias, etc.).
   :::
