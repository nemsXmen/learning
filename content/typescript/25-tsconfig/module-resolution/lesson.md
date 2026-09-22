---
id: typescript-25-module-resolution
title: moduleResolution
slug: module-resolution
technology: typescript
level: intermediate
module: 25-tsconfig
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-25-module]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Comprendre `moduleResolution`
- Connaître classic, node, node16, bundler
- L’aligner avec module

## Introduction

`moduleResolution` définit **comment** TypeScript résout les spécificateurs d’import.

## Concept

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

- `node` / `node10` : résolution Node historique
- `node16` / `nodenext` : rules Node ESM/CJS
- `bundler` : adapté aux bundlers (extensions, package exports…)

## Exemple

Projets Vite/Webpack → souvent `bundler`. Packages Node purs → `nodenext`.

## Comment ça fonctionne

Influence la recherche de fichiers, les extensions, les conditions `exports` de package.json.

## Erreurs fréquentes

- moduleResolution désynchronisé de module
- Oublier les extensions en NodeNext

## À retenir

- Résolution ≠ émission
- bundler vs nodenext selon le contexte
- Cohérence avec module

## Exercices

1. Configure moduleResolution sur bundler.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "moduleResolution": "bundler" } }
   ```
   :::

## Questions d'entretien

1. Quelle différence entre `module` et `moduleResolution` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `module` contrôle le format émis. `moduleResolution` contrôle comment les imports sont résolus au type-checking (chemins, extensions, exports de packages).
   :::
