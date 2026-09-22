---
id: typescript-44-source-maps
title: Source maps
slug: source-maps
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-44-project-references]
skills: [tooling]
tags: [typescript, tooling]
---

## Objectifs

- Générer des source maps
- Debug TS
- inline vs fichiers

## Introduction

Les **source maps** relient le JS émis au TypeScript source.

## Concept

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true
  }
}
```

## Exemple

DevTools / VS Code breakpoint sur le .ts.

## Comment ça fonctionne

Fichiers `.js.map` ou maps inline. Attention prod (taille, fuite de sources).

## Erreurs fréquentes

- sourceMap en prod sans stratégie
- Chemins sources incorrects (sourceRoot)

## À retenir

- sourceMap
- Debug
- Prod : politique claire

## Exercices

1. Option tsconfig pour émettre des .map ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `sourceMap: true`
   :::

## Questions d'entretien

1. Pourquoi les source maps sont-elles importantes ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Elles permettent de déboguer et lire les stack traces dans le TypeScript d’origine plutôt que dans le JavaScript généré.
   :::
