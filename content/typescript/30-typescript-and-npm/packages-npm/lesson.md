---
id: typescript-30-packages-npm
title: Packages NPM
slug: packages-npm
technology: typescript
level: intermediate
module: 30-typescript-and-npm
order: 1
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: []
skills: [npm]
tags: [typescript, npm]
---

## Objectifs

- Comprendre le rôle des packages npm pour TypeScript
- Voir package.json côté types
- Distinguer dépendance et types

## Introduction

L’écosystème TypeScript repose largement sur **npm** : libs, `@types`, outils de build.

## Concept

```json
{
  "name": "my-app",
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/lodash": "^4.17.0"
  }
}
```

## Exemple

Une lib peut livrer son JS + ses `.d.ts`, ou seulement du JS (types via DefinitelyTyped).

## Comment ça fonctionne

npm installe le code ; TypeScript résout les types via le package lui-même ou `@types/nom`.

## Erreurs fréquentes

- Oublier `@types` pour une lib JS pure
- Mettre typescript en dependency de prod inutilement (sauf libs)

## À retenir

- dependencies vs devDependencies
- Types shippés ou @types
- package.json = contrat

## Exercices

1. Où installes-tu généralement `typescript` dans une app ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   En devDependency.
   :::

## Questions d'entretien

1. Comment TypeScript trouve-t-il les types d’un package npm ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Via le champ `types`/`typings` du package, les `exports` conditionnels, ou à défaut le package `@types/nom` dans node_modules.
   :::
