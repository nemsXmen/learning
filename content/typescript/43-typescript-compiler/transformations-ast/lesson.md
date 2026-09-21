---
id: typescript-43-transformations-ast
title: Transformations AST
slug: transformations-ast
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 9
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-43-traversee-dast]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Écrire un transformer
- Factory de nœuds
- before / after

## Introduction

Une **transformation AST** remplace des nœuds pour modifier le code émis.

## Concept

```ts
const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    const visitor: ts.Visitor = (node) => {
      if (ts.isCallExpression(node)) {
        // return ts.factory.updateCallExpression(...)
      }
      return ts.visitEachChild(node, visitor, context);
    };
    return ts.visitNode(sourceFile, visitor);
  };
};
```

## Exemple

Remplacer une API dépréciée, injecter des helpers, strip de debug.

## Comment ça fonctionne

`ts.factory` crée des nœuds. Les transformers s’enregistrent sur emit.

## Erreurs fréquentes

- Casser positions/source maps
- Ne pas préserver trivia (commentaires) si besoin

## À retenir

- TransformerFactory
- ts.factory
- visitNode

## Exercices

1. Namespace pour créer des nœuds AST modernes ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `ts.factory`
   :::

## Questions d'entretien

1. Comment écrit-on un custom transformer TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Via une `TransformerFactory` qui retourne un visitor utilisant `ts.factory` pour produire de nouveaux nœuds, branchée sur l’emit (`before`/`after`).
   :::
