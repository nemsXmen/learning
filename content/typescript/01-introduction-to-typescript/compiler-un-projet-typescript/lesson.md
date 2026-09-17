---
id: typescript-01-compiler-un-projet-typescript
title: Compiler un projet TypeScript
slug: compiler-un-projet-typescript
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 7
estimatedMinutes: 20
difficulty: 2
xp: 50
prerequisites: [typescript-01-le-compilateur-tsc, typescript-01-premier-fichier-ts]
skills: [typescript-basics]
tags: [typescript, projet, compilation]
---

## Objectifs

- Passer d’un fichier isolé à un vrai projet
- Utiliser `tsc` avec un `tsconfig.json`
- Organiser les dossiers source et de sortie
- Lancer une compilation de projet complète

## Introduction

Compiler un seul fichier avec `tsc monfichier.ts` fonctionne pour les essais. Dès qu’on a plusieurs fichiers, on utilise un **projet TypeScript** piloté par `tsconfig.json`.

## Concept

Un projet TypeScript est défini par un fichier `tsconfig.json` à la racine.

Quand tu lances simplement :

```bash
npx tsc
```

`tsc` cherche le `tsconfig.json` le plus proche et compile tout le projet selon sa configuration.

### Structure typique

```text
mon-projet/
  src/
    index.ts
    utils.ts
  dist/           ← généré
  package.json
  tsconfig.json
```

Dans `tsconfig.json` on précise généralement :

- `"rootDir": "./src"`
- `"outDir": "./dist"`
- `"include": ["src/**/*"]`

## Exemple

`tsconfig.json` minimal :

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

`src/index.ts` :

```ts
import { add } from "./math";

console.log(add(2, 3));
```

`src/math.ts` :

```ts
export function add(a: number, b: number): number {
  return a + b;
}
```

Compilation :

```bash
npx tsc
```

Résultat :

```text
dist/
  index.js
  math.js
```

## Comment ça fonctionne

1. `tsc` lit `tsconfig.json`
2. Il résout la liste des fichiers (`include` / `exclude` / `files`)
3. Il type-check l’ensemble du programme (les imports sont suivis)
4. Il émet les fichiers JavaScript dans `outDir` en préservant la structure relative à `rootDir`

Les imports TypeScript (`import { add } from "./math"`) sont réécrits selon l’option `module` (CommonJS → `require`, ES modules → `import`).

## Erreurs fréquentes

- Oublier `"include"` ou `"files"`  
  `tsc` peut ne rien compiler ou compiler trop de choses.

- Mélanger `rootDir` et `outDir`  
  Si `rootDir` n’est pas correctement défini, la structure de sortie devient bizarre.

- Lancer `tsc` depuis le mauvais dossier  
  Il doit voir le `tsconfig.json`.

- Mettre des fichiers de test ou de config dans `include` sans les exclure

## À retenir

- Un projet = un `tsconfig.json`
- `npx tsc` (sans argument) compile le projet
- `rootDir` + `outDir` contrôlent la structure de sortie
- `include` définit les fichiers source
- Le type-checking se fait sur l’ensemble du graphe de modules

## Exercices

1. Crée un petit projet avec `src/index.ts` et `src/utils.ts`, un `tsconfig.json` et compile-le.

   :::indice
   Utilise `"rootDir": "./src"` et `"outDir": "./dist"`.
   :::

   :::solution
   Structure :
   ```text
   src/index.ts
   src/utils.ts
   tsconfig.json
   ```
   Puis `npx tsc`. Les fichiers apparaissent dans `dist/`.
   :::

2. À quoi sert l’option `"strict": true` dans un projet ?

   :::indice
   C’est un ensemble de vérifications.
   :::

   :::solution
   Elle active un ensemble d’options strictes (`noImplicitAny`, `strictNullChecks`, etc.) qui rendent le type-checking beaucoup plus sûr. C’est la configuration recommandée pour tout nouveau projet.
   :::

## Questions d'entretien

1. Comment compiles-tu un projet TypeScript qui contient plusieurs fichiers et un `tsconfig.json` ?

   :::indice
   La commande la plus simple.
   :::

   :::reponse
   On se place à la racine du projet (là où se trouve le `tsconfig.json`) et on lance `npx tsc` (ou `npm run build` si un script est défini). `tsc` lit automatiquement la configuration et compile tout le projet.
   :::
