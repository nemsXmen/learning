---
id: typescript-43-emission
title: Emission
slug: emission
technology: typescript
level: advanced
module: 43-typescript-compiler
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-43-transformation]
skills: [compiler]
tags: [typescript, compiler]
---

## Objectifs

- Émettre JS / d.ts / maps
- declaration, sourceMap
- Emit sans check ?

## Introduction

L’**émission** écrit les artefacts de sortie.

## Concept

Options clés :
- `outDir`, `declaration`, `declarationMap`
- `sourceMap`, `inlineSourceMap`
- `emitDeclarationOnly`

```bash
tsc -p tsconfig.json
```

## Exemple

`noEmitOnError` empêche l’emit si diagnostics.

## Comment ça fonctionne

Printer AST → texte. Les .d.ts décrivent l’API publique.

## Erreurs fréquentes

- declaration true sans types exportables propres
- Mélanger outDir et structure de sources

## À retenir

- JS + d.ts + maps
- noEmit / emitDeclarationOnly
- Erreurs vs emit

## Exercices

1. Option pour n’émettre que les déclarations ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `emitDeclarationOnly`
   :::

## Questions d'entretien

1. Que produit la phase d’émission TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le JavaScript cible, optionnellement les fichiers de déclaration `.d.ts` et les source maps, selon les compilerOptions.
   :::
