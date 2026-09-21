---
id: typescript-29-fs
title: fs
slug: fs
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-29-variables-denvironnement]
skills: [nodejs]
tags: [typescript, nodejs, fs]
---

## Objectifs

- Typer les APIs `fs` / `fs/promises`
- Lire et écrire des fichiers
- Gérer Buffer vs string

## Introduction

Le module `fs` donne accès au système de fichiers, avec types via `@types/node`.

## Concept

```ts
import { readFile, writeFile } from "fs/promises";

const content: string = await readFile("file.txt", "utf8");
const buf: Buffer = await readFile("file.bin");
await writeFile("out.txt", content, "utf8");
```

## Exemple

```ts
import { existsSync } from "fs";
if (existsSync(path)) {
  // ...
}
```

## Comment ça fonctionne

Les overloads de `readFile` distinguent encoding (string) vs Buffer. Les versions promises sont préférables à callbacks.

## Erreurs fréquentes

- Oublier l’encoding → Buffer inattendu
- Chemins non normalisés

## À retenir

- fs/promises + async
- string vs Buffer selon encoding
- Erreurs I/O à gérer

## Exercices

1. Lis un fichier texte en utf8 avec fs/promises.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   import { readFile } from "fs/promises";
   const text = await readFile("notes.txt", "utf8");
   ```
   :::

## Questions d'entretien

1. Pourquoi préciser "utf8" à readFile ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Sans encoding, le résultat est un Buffer. Avec "utf8", TypeScript et Node retournent une string décodée.
   :::
