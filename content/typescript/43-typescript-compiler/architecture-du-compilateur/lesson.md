---
id: typescript-43-architecture-du-compilateur
title: Architecture du compilateur
slug: architecture-du-compilateur
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 1
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-25-base-url]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Vue d’ensemble de tsc
- Pipeline scan → parse → bind → check → emit
- Rôle de chaque phase

## Introduction

Le **compilateur TypeScript** transforme du TS en JS (et .d.ts) via plusieurs phases.

## Concept

Pipeline simplifié :
1. **Scan / Parse** — tokens → AST
2. **Bind** — liaisons de symboles
3. **Check** — typage et diagnostics
4. **Transform** — downlevel (ES targets, JSX…)
5. **Emit** — JS, maps, déclarations

```text
Source → AST → Checker → Transforms → Emit
```

## Exemple

`tsc --noEmit` s’arrête après le check. `tsc` complète jusqu’à l’émission.

## Comment ça fonctionne

Le package `typescript` expose ce pipeline via l’API compilateur.

## Erreurs fréquentes

- Croire que tsc exécute le programme
- Confondre transpile-only (esbuild/swc) et full check

## À retenir

- Phases distinctes
- Check ≠ emit
- API = même moteur

## Exercices

1. Quelle phase produit les erreurs de type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Type checking (checker).
   :::

## Questions d'entretien

1. Quelles sont les grandes phases du compilateur TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parsing (AST), binding des symboles, type checking, transformations (target/JSX…), puis émission JS/d.ts/source maps.
   :::
