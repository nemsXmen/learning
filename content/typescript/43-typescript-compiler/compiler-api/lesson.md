---
id: typescript-43-compiler-api
title: Compiler API
slug: compiler-api
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 7
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-43-emission]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Utiliser le package typescript en code
- Program, SourceFile, Checker
- Cas codegen / outils

## Introduction

La **Compiler API** expose le moteur tsc aux outils.

## Concept

```ts
import ts from "typescript";

const options: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  strict: true
};

const host = ts.createCompilerHost(options);
const program = ts.createProgram(["src/index.ts"], options, host);
const diags = ts.getPreEmitDiagnostics(program);
```

## Exemple

Générateurs de code, linters custom, migrations AST, doc.

## Comment ça fonctionne

Même code path que `tsc` CLI. Host abstrait FS/IO.

## Erreurs fréquentes

- Mauvais module resolution host
- Oublier de lire les diagnostics

## À retenir

- createProgram
- CompilerHost
- Diagnostics

## Exercices

1. Package npm de l’API ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `typescript`
   :::

## Questions d'entretien

1. À quoi sert la Compiler API ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À piloter programmatiquement parse, check et emit — pour codegen, outils d’analyse, transformers et automatisations basées sur le vrai checker TS.
   :::
