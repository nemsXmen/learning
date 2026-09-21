---
id: typescript-43-plugins-et-tooling
title: Plugins et tooling
slug: plugins-et-tooling
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-43-transformations-ast]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Language service plugins
- ts-patch / ttypescript (contexte)
- Écosystème d’outils

## Introduction

Autour du compilateur gravitent **plugins IDE** et outils d’analyse.

## Concept

- **Language Service** : completions, quick info (utilisé par VS Code)
- **Plugins** `compilerOptions.plugins` : étendent le language service
- Outils : ESLint typescript-eslint, ts-morph, jscodeshift, api-extractor

## Exemple

Plugin qui ajoute des diagnostics custom dans l’éditeur.

## Comment ça fonctionne

Le language service réutilise checker + AST. Les plugins s’y branchent sans forker tsc.

## Erreurs fréquentes

- Confondre transform build et plugin IDE
- Plugins non supportés en CI tsc pure

## À retenir

- Language service ≠ emit
- Plugins éditeur
- ts-morph pour DX AST

## Exercices

1. ts-morph simplifie surtout ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   La manipulation d’AST TypeScript avec une API plus ergonomique.
   :::

## Questions d'entretien

1. Différence language service plugin vs custom transformer ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le plugin language service enrichit l’expérience éditeur (diagnostics, completions). Le transformer modifie le code émis en build. Ce n’est pas le même point d’extension.
   :::
