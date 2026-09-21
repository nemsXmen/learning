---
id: typescript-25-base-url
title: baseUrl
slug: base-url
technology: typescript
level: intermediate
module: 25-tsconfig
order: 15
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-25-skip-lib-check]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Configurer `baseUrl`
- Résoudre des imports non relatifs
- Préparer `paths`

## Introduction

`baseUrl` définit la base pour la résolution des modules non relatifs.

## Concept

```json
{
  "compilerOptions": {
    "baseUrl": "."
  }
}
```

```ts
import { Button } from "src/components/Button";
```

## Exemple

Souvent `"baseUrl": "./src"` ou `"."` à la racine du projet.

## Comment ça fonctionne

Les imports qui ne commencent pas par `./` ou `../` sont résolus relativement à `baseUrl` (puis paths, puis node_modules…).

## Erreurs fréquentes

- baseUrl sans alignement du bundler / runtime
- Chemins qui marchent en TS mais pas à l’exécution

## À retenir

- Base des imports absolus
- Doit coller au bundler
- Souvent avec paths

## Exercices

1. Configure baseUrl sur `"."`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "baseUrl": "." } }
   ```
   :::

## Questions d'entretien

1. À quoi sert `baseUrl` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À définir le répertoire de base pour résoudre les imports non relatifs, permettant des chemins absolus côté TypeScript (à synchroniser avec le bundler/runtime).
   :::
