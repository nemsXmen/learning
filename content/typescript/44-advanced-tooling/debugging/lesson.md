---
id: typescript-44-debugging
title: Debugging
slug: debugging
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-44-source-maps]
skills: [tooling]
tags: [typescript, tooling]
---

## Objectifs

- Debugger du TS (Node / navigateur)
- launch.json VS Code
- ts-node / tsx

## Introduction

Déboguer **TypeScript** s’appuie sur maps et runtimes adaptés.

## Concept

```json
{
  "type": "node",
  "request": "launch",
  "runtimeArgs": ["-r", "tsx/cjs"],
  "args": ["${workspaceFolder}/src/index.ts"]
}
```

## Exemple

Chrome DevTools + source maps pour le front. `tsx` / `ts-node` pour le back.

## Comment ça fonctionne

Le debugger exécute du JS mappé vers les lignes TS.

## Erreurs fréquentes

- Breakpoints unbound (mauvaises maps)
- OutDir non aligné

## À retenir

- Source maps on
- Config debugger
- tsx/ts-node

## Exercices

1. Symptôme de source maps incorrectes ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Breakpoints non liés / stack sur JS illisible.
   :::

## Questions d'entretien

1. Comment débogues-tu un service TypeScript Node ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Source maps activées, debugger VS Code/Node attaché, éventuellement loader `tsx`/`ts-node`, breakpoints sur les sources TS.
   :::
