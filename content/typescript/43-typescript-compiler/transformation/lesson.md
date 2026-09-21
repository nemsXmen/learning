---
id: typescript-43-transformation
title: Transformation
slug: transformation
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-43-type-checking]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Downlevel transforms
- JSX, decorators, class fields
- Custom transformers

## Introduction

Après le check, TypeScript **transforme** l’AST pour la cible d’émission.

## Concept

Exemples de transforms :
- classes ES5
- async/await → generators (anciennes cibles)
- JSX → React.createElement / jsx runtime
- enum → objets

## Exemple

`compilerOptions.target`, `jsx`, `experimentalDecorators`.

## Comment ça fonctionne

Transforms officiels + transformers custom via API (`transformers` before/after).

## Erreurs fréquentes

- Attendre le même runtime que le source TS
- Custom transform qui casse les source maps

## À retenir

- Target guide les transforms
- JSX/decorators
- Custom possible

## Exercices

1. Qui décide du downlevel async/await ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   L’option `target` (et lib associée).
   :::

## Questions d'entretien

1. Que sont les transformations du compilateur TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Des passes qui réécrivent l’AST pour émettre un JS compatible avec la cible (ES version, JSX, etc.), éventuellement étendues par des transformers custom.
   :::
