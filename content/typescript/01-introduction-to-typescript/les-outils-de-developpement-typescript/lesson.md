---
id: typescript-01-les-outils-de-developpement-typescript
title: Les outils de développement TypeScript
slug: les-outils-de-developpement-typescript
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 14
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-01-installation-de-typescript]
skills: [typescript-basics]
tags: [typescript, outils, vscode]
---

## Objectifs

- Connaître les outils essentiels pour développer en TypeScript
- Configurer VS Code (ou ton éditeur) correctement
- Savoir quels outils complètent TypeScript

## Introduction

TypeScript brille particulièrement grâce à son écosystème d’outils, en premier lieu l’éditeur.

## Concept

### VS Code (recommandé)

VS Code intègre nativement le language service TypeScript. Tu bénéficies de :

- Autocomplétion ultra-précise
- Détection d’erreurs en temps réel
- Navigation (Aller à la définition, Trouver les références)
- Refactorings (renommage, extraction…)
- Hover avec affichage des types

Extensions utiles :
- ESLint
- Prettier
- Error Lens (affiche les erreurs inline)
- Pretty TypeScript Errors

### Autres outils

- **ESLint** + `@typescript-eslint` : règles de style et de qualité
- **Prettier** : formatage
- **tsx** / **ts-node** : exécution rapide
- **Vitest** / **Jest** : tests
- **Zod** / **Valibot** : validation runtime

## Exemple

Dans VS Code, simplement ouvrir un dossier avec un `tsconfig.json` active automatiquement le language service. Les erreurs apparaissent en rouge souligné, et le hover montre les types.

## Comment ça fonctionne

Le language service de TypeScript (le même moteur que `tsc`) tourne en arrière-plan dans l’éditeur. Il fournit les diagnostics, l’autocomplétion et la navigation sans avoir besoin de lancer `tsc` manuellement.

## Erreurs fréquentes

- Travailler sans `tsconfig.json`  
  L’éditeur se comporte moins bien.

- Désactiver le language service TypeScript  
  On perd tout l’intérêt.

## À retenir

- VS Code + TypeScript = expérience de développement exceptionnelle
- Le language service donne le feedback en temps réel
- ESLint + Prettier complètent le setup
- Les outils de validation runtime (Zod…) sont le complément naturel

## Exercices

1. Ouvre un projet TypeScript dans VS Code et survole une variable pour voir son type inféré.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   Le hover affiche le type calculé par le language service.
   :::

## Questions d'entretien


1. Quels outils utilises-tu au quotidien pour développer en TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   VS Code avec le language service TypeScript intégré, ESLint avec les règles @typescript-eslint, Prettier pour le formatage, et souvent tsx pour l’exécution rapide en développement. Pour la validation runtime j’ajoute Zod ou un équivalent.
   :::

