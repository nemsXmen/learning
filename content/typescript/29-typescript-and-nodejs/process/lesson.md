---
id: typescript-29-process
title: process
slug: process
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-29-installer-at-types-node]
skills: [nodejs]
tags: [typescript, nodejs]
---

## Objectifs

- Typer l’usage de `process`
- Connaître argv, env, cwd, exit
- Lire les types fournis

## Introduction

`process` est l’objet global Node décrivant le processus en cours.

## Concept

```ts
process.argv; // string[]
process.env; // NodeJS.ProcessEnv
process.cwd(); // string
process.exit(1);
process.platform; // NodeJS.Platform
```

## Exemple

```ts
const port = Number(process.env.PORT ?? 3000);
```

## Comment ça fonctionne

`@types/node` définit l’interface `NodeJS.Process` avec les membres standards.

## Erreurs fréquentes

- process.env.FOO comme string garanti (c’est string | undefined)
- exit sans code clair

## À retenir

- argv, env, cwd, exit
- env values = string | undefined
- Types via @types/node

## Exercices

1. Lis PORT depuis env avec défaut 3000.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const port = Number(process.env.PORT ?? 3000);
   ```
   :::

## Questions d'entretien

1. Quel est le type de `process.env.NODE_ENV` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `string | undefined` — les variables d’environnement peuvent être absentes. Il faut gérer le cas undefined (défaut, validation).
   :::
