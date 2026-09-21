---
id: typescript-44-language-service
title: Language Service
slug: language-service
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-44-debugging]
skills: [tooling]
tags: [typescript, tooling]
---

## Objectifs

- Rôle du language service
- Completions, quick info, refactor
- Lien tsserver

## Introduction

Le **language service** alimente l’IDE (VS Code via tsserver).

## Concept

Fonctionnalités :
- completions
- go to definition
- find references
- rename
- quick fixes
- diagnostics temps réel

## Exemple

Plugins language service (ex. frameworks) enrichissent ces features.

## Comment ça fonctionne

tsserver maintient un programme en mémoire, incrémente les updates fichier.

## Erreurs fréquentes

- Mauvais tsconfig « solution » → features cassées
- Trop de projets ouverts lents

## À retenir

- tsserver
- DX éditeur
- tsconfig critique

## Exercices

1. Processus typique derrière VS Code TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `tsserver` (language service).
   :::

## Questions d'entretien

1. Language service vs compilateur CLI ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le CLI (`tsc`) batch compile/check/emit. Le language service répond de façon interactive à l’éditeur (completions, diagnostics live) via tsserver.
   :::
