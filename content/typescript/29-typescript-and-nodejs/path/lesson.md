---
id: typescript-29-path
title: path
slug: path
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 5
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-29-fs]
skills: [nodejs]
tags: [typescript, nodejs]
---

## Objectifs

- Utiliser le module `path` typé
- Joindre et résoudre des chemins
- Éviter la concaténation manuelle

## Introduction

`path` normalise les chemins de fichiers de façon portable.

## Concept

```ts
import path from "path";

path.join("/var", "log", "app.log");
path.resolve("src", "index.ts");
path.extname("file.ts"); // ".ts"
path.basename("/a/b/c.txt"); // "c.txt"
path.dirname("/a/b/c.txt"); // "/a/b"
```

## Exemple

```ts
const root = path.join(__dirname, "..");
```

En ESM : souvent `import.meta.url` + `fileURLToPath` pour équivalent de `__dirname`.

## Comment ça fonctionne

Les signatures sont typées (string in → string out). Comportement OS-dependent (séparateurs).

## Erreurs fréquentes

- Concaténer avec `/` à la main
- Mélanger __dirname et ESM sans adaptation

## À retenir

- join / resolve
- extname, basename, dirname
- Portable cross-OS

## Exercices

1. Construis le chemin data/users.json depuis process.cwd().

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   path.join(process.cwd(), "data", "users.json");
   ```
   :::

## Questions d'entretien

1. Pourquoi préférer path.join à la concaténation de strings ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour gérer correctement les séparateurs selon l’OS et éviter les doubles slashs / chemins cassés.
   :::
