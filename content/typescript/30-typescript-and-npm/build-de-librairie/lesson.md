---
id: typescript-30-build-de-librairie
title: Build de librairie
slug: build-de-librairie
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-30-publier-une-librairie]
skills: [npm]
tags: [typescript, npm, build]
---

## Objectifs

- Configurer un build de lib TS
- tsc vs bundler (tsup, unbuild, rollup)
- Générer types et formats multiples

## Introduction

Le **build** transforme le TypeScript source en artefacts npm.

## Concept – tsc simple

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "module": "NodeNext",
    "target": "ES2020"
  },
  "include": ["src"]
}
```

## Exemple – multi-format

Outils comme `tsup` / `unbuild` émettent CJS + ESM + d.ts en une commande.



## Concept

Ce concept s’appuie sur les notions présentées dans cette leçon.

## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

Les consommateurs importent les fichiers émis, pas le `src/` (sauf packages « source »).

## Erreurs fréquentes

- Paths non réécrits pour le runtime
- Types qui pointent vers src non publié

## À retenir

- declaration + outDir
- Outils multi-format
- Tester le package émis

## Exercices

1. Active declaration et outDir dist dans un tsconfig lib.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "outDir": "dist", "declaration": true } }
   ```
   :::

## Questions d'entretien

1. tsc seul ou bundler pour une lib ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   tsc suffit pour des libs simples (JS + d.ts). Un bundler (tsup, etc.) aide pour multi-format ESM/CJS, minify optionnelle, et DX de release. Le choix dépend des cibles consommateurs.
   :::
