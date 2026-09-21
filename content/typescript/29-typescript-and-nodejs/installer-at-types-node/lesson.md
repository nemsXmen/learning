---
id: typescript-29-installer-at-types-node
title: Installer @types/node
slug: installer-at-types-node
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 1
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-23-at-types]
skills: [nodejs]
tags: [typescript, nodejs]
---

## Objectifs

- Installer les types Node
- Comprendre leur rôle
- Les activer dans le projet

## Introduction

`@types/node` fournit les déclarations TypeScript pour l’API Node.js.

## Concept

```bash
npm install --save-dev @types/node
```

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

Souvent, TypeScript les charge automatiquement depuis `node_modules/@types`.

## Exemple

Après installation : `process`, `Buffer`, `fs`, etc. sont reconnus.

## Comment ça fonctionne

Les `.d.ts` de `@types/node` décrivent l’API runtime Node. La version de `@types/node` devrait coller à la version de Node ciblée.

## Erreurs fréquentes

- Versions désynchronisées Node / @types/node
- Oublier d’installer en devDependency

## À retenir

- `npm i -D @types/node`
- Types de l’API Node
- Aligner les versions

## Exercices

1. Quelle commande installe les types Node ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```bash
   npm i -D @types/node
   ```
   :::

## Questions d'entretien

1. Pourquoi a-t-on besoin de `@types/node` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que Node.js est une API JavaScript : sans fichiers de déclaration, TypeScript ne connaît pas `process`, `fs`, `Buffer`, etc. `@types/node` fournit ces types.
   :::
