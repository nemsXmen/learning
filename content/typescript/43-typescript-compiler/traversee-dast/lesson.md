---
id: typescript-43-traversee-dast
title: Traversée d’AST
slug: traversee-dast
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-43-compiler-api]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Visiteurs
- ts.visitNode / visitEachChild
- Collecte d’infos

## Introduction

La **traversée** parcourt l’AST pour analyser ou préparer des transforms.

## Concept

```ts
const visitor: ts.Visitor = (node) => {
  if (ts.isIdentifier(node) && node.text === "TODO") {
    // ...
  }
  return ts.visitEachChild(node, visitor, context);
};
```

## Exemple

Compter les imports, lister les exports, trouver des appels à une API.

## Comment ça fonctionne

Visitor pattern : descente récursive, retour de nœuds (mêmes ou nouveaux).

## Erreurs fréquentes

- Oublier visitEachChild → sous-arbre non visité
- Side effects non locaux difficiles à raisonner

## À retenir

- Visitor
- visitEachChild
- Guards is*

## Exercices

1. Pourquoi appeler visitEachChild ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour continuer la traversée sur les enfants.
   :::

## Questions d'entretien

1. Pattern classique pour parcourir un AST TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un visiteur récursif avec `ts.visitEachChild` / `forEachChild` et des type guards pour traiter les nœuds ciblés.
   :::
