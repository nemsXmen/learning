---
id: typescript-01-comprendre-tsconfig-json
title: Comprendre `tsconfig.json`
slug: comprendre-tsconfig-json
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 8
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites: [typescript-01-compiler-un-projet-typescript]
skills: [typescript-basics]
tags: [typescript, tsconfig, configuration]
---

## Objectifs

- Comprendre le rôle de `tsconfig.json`
- Connaître les options les plus importantes pour un débutant
- Savoir générer et lire un fichier de configuration
- Activer le mode strict

## Introduction

Le fichier `tsconfig.json` est le centre de configuration d’un projet TypeScript. C’est lui qui dit à `tsc` *quoi* compiler et *comment*.

## Concept

`tsconfig.json` contient principalement deux sections :

- `compilerOptions` : comment compiler
- `include` / `exclude` / `files` : quels fichiers prendre en compte

### Générer un fichier de base

```bash
npx tsc --init
```

Cela crée un `tsconfig.json` commenté avec presque toutes les options.

### Options essentielles pour commencer

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- **target** : version d’ECMAScript du JavaScript généré
- **module** : format des modules (commonjs, esnext, node16…)
- **strict** : active toutes les vérifications strictes (fortement recommandé)
- **outDir** / **rootDir** : organisation des fichiers de sortie
- **esModuleInterop** : meilleure interopérabilité avec les modules CommonJS
- **skipLibCheck** : saute le type-checking des fichiers de déclaration des dépendances (accélère beaucoup)

## Exemple

Avec `"strict": true`, ce code devient invalide :

```ts
function printName(name) {   // ❌ Parameter 'name' implicitly has an 'any' type
  console.log(name);
}
```

Il faut écrire :

```ts
function printName(name: string) {
  console.log(name);
}
```

## Comment ça fonctionne

Quand `tsc` démarre, il cherche un `tsconfig.json` en remontant les dossiers. Une fois trouvé, il applique les options et détermine l’ensemble des fichiers à compiler grâce à `include` et `exclude`.

Les options peuvent aussi être surchargées en ligne de commande, mais la source de vérité reste le fichier.

## Erreurs fréquentes

- Laisser `"strict": false` ou ne pas l’activer  
  On perd une grande partie de la valeur de TypeScript.

- Mettre `"target": "ES3"` ou `"ES5"` par défaut sur un projet moderne  
  Génère du code inutilement vieux.

- Oublier `exclude: ["node_modules"]`  
  Rarement un problème grâce aux defaults, mais bon à connaître.

- Avoir plusieurs `tsconfig.json` sans comprendre les project references

## À retenir

- `tsconfig.json` pilote tout le projet
- `"strict": true` est le point de départ recommandé
- `include` + `rootDir` + `outDir` définissent la structure
- `npx tsc --init` génère un fichier de base commenté
- Les options peuvent être lues et comprises progressivement

## Exercices

1. Génère un `tsconfig.json` avec `tsc --init` et active explicitement `"strict": true`.

   :::indice
   Ouvre le fichier et cherche l’option `strict`.
   :::

   :::solution
   ```bash
   npx tsc --init
   ```
   Puis dans le fichier, assure-toi que `"strict": true` est présent et non commenté.
   :::

2. Quelle option permet d’ignorer le type-checking des `.d.ts` des node_modules ?

   :::indice
   Elle accélère nettement la compilation.
   :::

   :::solution
   `"skipLibCheck": true`
   :::

## Questions d'entretien

1. À quoi sert le fichier `tsconfig.json` ?

   :::indice
   Configuration du compilateur et sélection des fichiers.
   :::

   :::reponse
   Il configure le compilateur TypeScript (`compilerOptions`) et définit quels fichiers font partie du projet (`include`/`exclude`). C’est la source de vérité pour la façon dont `tsc` type-check et émet le JavaScript.
   :::

2. Pourquoi recommande-t-on d’activer `"strict": true` ?

   :::indice
   Pense à la qualité du type-checking.
   :::

   :::reponse
   Parce que cela active un ensemble de vérifications strictes (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, etc.) qui détectent bien plus d’erreurs potentielles. C’est la configuration moderne recommandée pour tout nouveau projet.
   :::
