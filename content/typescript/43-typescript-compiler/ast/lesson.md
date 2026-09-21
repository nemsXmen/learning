---
id: typescript-43-ast
title: AST
slug: ast
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-43-parsing]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Lire un AST TypeScript
- Node kinds
- Navigation parent/enfants

## Introduction

L’**AST** représente la structure du programme (nœuds typés).

## Concept

```ts
function walk(node: ts.Node) {
  if (ts.isFunctionDeclaration(node) && node.name) {
    console.log(node.name.text);
  }
  ts.forEachChild(node, walk);
}
```

## Exemple

`SyntaxKind`, guards `ts.is*` (isCallExpression, isIdentifier…).

## Comment ça fonctionne

Chaque nœud a un kind, des enfants, parfois des flags. L’AST est immuable conceptuellement pendant le check.

## Erreurs fréquentes

- Muter l’AST sans factory
- Oublier forEachChild sur certains nœuds

## À retenir

- SyntaxKind
- ts.is*
- forEachChild

## Exercices

1. Guard pour une déclaration de fonction ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `ts.isFunctionDeclaration`
   :::

## Questions d'entretien

1. Comment explores-tu un AST TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec `ts.forEachChild` / visiteurs, des type guards `ts.isX`, et `SyntaxKind` pour identifier les nœuds d’intérêt.
   :::
