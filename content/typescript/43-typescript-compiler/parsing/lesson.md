---
id: typescript-43-parsing
title: Parsing
slug: parsing
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-43-architecture-du-compilateur]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Scanner et parser
- SourceFile
- Erreurs de syntaxe

## Introduction

Le **parsing** convertit le texte source en arbre syntaxique.

## Concept

```ts
import ts from "typescript";

const source = ts.createSourceFile(
  "file.ts",
  "const x: number = 1;",
  ts.ScriptTarget.Latest,
  true
);
```

## Exemple

Erreurs de syntaxe → diagnostics avant même le typage.

## Comment ça fonctionne

Lexer (tokens) puis parser (grammaire TS/JSX). Options : target, script vs module.

## Erreurs fréquentes

- Fichier mal encodé
- JSX sans config jsx

## À retenir

- createSourceFile
- Diagnostics syntaxe
- ScriptTarget

## Exercices

1. API pour créer un AST depuis une string ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `ts.createSourceFile(...)`
   :::

## Questions d'entretien

1. Que fait la phase de parsing TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Elle transforme le texte source en AST (`SourceFile`), en signalant les erreurs de syntaxe avant le type checking.
   :::
