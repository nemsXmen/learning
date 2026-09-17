---
id: typescript-module-18
title: Utility Types
slug: module-18
technology: typescript
level: intermediate
module: module-18
order: 1
estimatedMinutes: 30
difficulty: 2
xp: 170
prerequisites: []
skills:
  - typescript-module-18
tags:
  - typescript
  - module-18
---

## Objectifs

- Comprendre les notions essentielles de **Utility Types**.
- Savoir les appliquer dans un code TypeScript strict et lisible.
- Identifier les compromis de conception avant de choisir une solution.

## Introduction

Ce module s'inscrit dans le parcours **TypeScript Zero to Hero**. Il relie les fondamentaux du langage à des pratiques utilisables dans une application réelle, en conservant la sécurité apportée par le compilateur.

## Concept

Utility Types doit être abordé comme un contrat entre le code, le compilateur et les personnes qui le maintiennent. Commence par modéliser les données, préfère les types explicites aux hypothèses implicites et garde les frontières d'exécution sous contrôle.

## Exemple

```ts
// Décris d'abord la forme attendue, puis laisse TypeScript vérifier les usages.
type ModuleExample = { title: string; ready: boolean };

const example: ModuleExample = { title: 'Utility Types', ready: true };
console.log(example.title);
```

## Comment ça fonctionne

Le compilateur analyse les déclarations et les usages pour détecter les incohérences avant l'exécution. La vérification statique ne remplace pas la validation au runtime : les données venant d'un formulaire, d'un fichier ou d'une API doivent toujours être contrôlées à leur frontière.

## Erreurs fréquentes

- Ajouter `any` pour faire disparaître une erreur au lieu de comprendre le contrat.
- Confondre une annotation TypeScript avec une conversion de valeur au runtime.
- Coupler des types internes à des données externes sans validation.

## À retenir

- Un type utile décrit une intention vérifiable.
- Le mode `strict` rend les contrats plus fiables.
- Les types avancés doivent simplifier l'usage, pas impressionner le lecteur.

## Exercices

1. Crée une représentation typée de **Utility Types**, puis écris une fonction qui refuse une donnée invalide.

   :::indice
   Commence par lister les propriétés nécessaires et les cas limites avant d'écrire la fonction.
   :::

   :::solution
   ```ts
   type Item = { name: string; valid: boolean };
   const item: Item = { name: 'Utility Types', valid: true };
   ```
   :::

## Questions d'entretien

1. Pourquoi les types TypeScript ne suffisent-ils pas à valider une donnée reçue au runtime ?

   :::indice
   Pense à l'effacement des types lors de la compilation et aux frontières de l'application.
   :::

   :::reponse
   Les annotations sont supprimées à l'exécution. Une donnée externe doit donc être vérifiée par un schéma ou un type guard avant d'être utilisée.
   :::
