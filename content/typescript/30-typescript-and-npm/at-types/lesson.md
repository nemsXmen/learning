---
id: typescript-30-at-types
title: "@types"
slug: 30-at-types
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-30-packages-types]
skills: [npm]
tags: [typescript, npm, definitelytyped]
---

## Objectifs

- Utiliser les packages `@types/*`
- Comprendre DefinitelyTyped
- Gérer les conflits de versions

## Introduction

`@types/nom` fournit des types communautaires pour des libs sans types intégrés.

## Concept

```bash
npm i -D @types/express @types/lodash
```

TypeScript les charge depuis `node_modules/@types` par défaut.

## Exemple

Si la lib commence à shipper ses propres types, on peut retirer `@types` pour éviter les doublons.

## Comment ça fonctionne

Le compilateur fusionne / priorise selon les règles de résolution. `compilerOptions.types` peut restreindre la liste auto-incluse.

## Erreurs fréquentes

- Doublons types (lib + @types)
- @types trop vieux

## À retenir

- DefinitelyTyped
- devDependency
- Retirer @types si types natifs présents

## Exercices

1. Installe les types pour Node.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```bash
   npm i -D @types/node
   ```
   :::

## Questions d'entretien

1. Que faire si une lib ajoute ses propres types alors que @types existe encore ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Désinstaller `@types/lib` pour éviter les conflits et dual packages, et s’appuyer sur les types officiels.
   :::
