---
id: typescript-30-publier-une-librairie
title: Publier une librairie
slug: publier-une-librairie
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-30-typesversions]
skills: [npm]
tags: [typescript, npm]
---

## Objectifs

- Préparer une lib TypeScript pour npm
- Checklist avant publish
- Versioning et fichiers inclus

## Introduction

Publier une lib TS implique **build**, **types**, et **métadonnées** correctes.

## Concept – checklist

1. `tsc` (ou bundler) → `dist/`
2. `declaration: true`
3. `package.json` : main, types, exports, files
4. `.npmignore` / files pour exclure src tests
5. `npm version` + `npm publish`

```json
{
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

## Exemple

Tester en local : `npm pack` puis installer le tarball dans un projet test.



## Concept

Ce concept s’appuie sur les notions présentées dans cette leçon.

## Comment ça fonctionne

npm publie le contenu filtré ; les consommateurs installent JS + d.ts.

## Erreurs fréquentes

- Publier sans .d.ts
- Inclure node_modules / tests lourds

## À retenir

- Build avant publish
- files / exports / types
- Tester via pack

## Exercices

1. Cite 3 champs package.json critiques pour une lib typée.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   main (ou exports), types, files.
   :::

## Questions d'entretien

1. Quelles étapes clés avant de publier une lib TypeScript sur npm ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Compiler en JS + d.ts, renseigner main/types/exports/files, exclure sources inutiles, versionner, vérifier avec `npm pack`, puis publish.
   :::
