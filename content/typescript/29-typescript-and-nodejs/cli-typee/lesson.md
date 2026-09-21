---
id: typescript-29-cli-typee
title: CLI typée
slug: cli-typee
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-29-configuration-typee]
skills: [nodejs]
tags: [typescript, nodejs, cli]
---

## Objectifs

- Typer une interface en ligne de commande
- Parser argv
- Utiliser des libs (commander, yargs, citty…)

## Introduction

Les CLI Node passent par `process.argv` — à parser et typer.

## Concept

```ts
// argv brut
// node app.js deploy --env production
const args = process.argv.slice(2);

// Avec une lib
import { Command } from "commander";
const program = new Command();
program
  .option("-e, --env <env>", "environment")
  .parse();
const opts = program.opts<{ env?: string }>();
```

## Exemple

Valider les options avec un schema après parse.

## Comment ça fonctionne

Les libs exposent des types pour options/arguments. On affine avec nos types métier.

## Erreurs fréquentes

- Parser argv à la main sans tests
- Options optionnelles non gérées (undefined)

## À retenir

- argv → parse → type
- Libs CLI + validation
- Messages d’erreur clairs

## Exercices

1. Extraire les args utilisateur depuis process.argv.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const args = process.argv.slice(2);
   ```
   :::

## Questions d'entretien

1. Comment types-tu les options d’une CLI Node ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En utilisant une lib de parsing (commander, yargs…) qui expose des types, puis en validant éventuellement les options avec un schema pour obtenir un objet d’options métier sûr.
   :::
