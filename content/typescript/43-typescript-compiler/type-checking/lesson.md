---
id: typescript-43-type-checking
title: Type checking
slug: type-checking
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 4
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-43-ast]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Rôle du checker
- TypeChecker API
- Diagnostics

## Introduction

Le **type checker** assigne des types et émet des diagnostics.

## Concept

```ts
const program = ts.createProgram(["src/index.ts"], options);
const checker = program.getTypeChecker();
const source = program.getSourceFile("src/index.ts")!;

// type d'un nœud
// checker.getTypeAtLocation(node)
```

## Exemple

`getSymbolAtLocation`, `typeToString`, `getSignaturesOfType`.

## Comment ça fonctionne

Le checker s’appuie sur symboles liés et règles de typage (strict, lib…).

## Erreurs fréquentes

- Utiliser checker sans Program complet
- Ignorer les diagnostics

## À retenir

- createProgram
- getTypeChecker
- Diagnostics

## Exercices

1. Comment obtenir le checker ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `program.getTypeChecker()`
   :::

## Questions d'entretien

1. Que permet l’API TypeChecker ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Interroger le type d’un nœud, ses symboles, signatures, et formater des types — base des outils (IDE, linters, codegen).
   :::
