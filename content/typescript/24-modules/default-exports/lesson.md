---
id: typescript-24-default-exports
title: Default exports
slug: default-exports
technology: typescript
level: intermediate
module: 24-modules
order: 5
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-24-named-exports]
skills: [modules]
tags: [typescript, modules]
---

## Objectifs

- Utiliser les default exports
- Les importer
- Connaître les trade-offs vs named

## Introduction

Un module peut avoir **un** export default.

## Concept

```ts
// Button.tsx
export default function Button() {
  return null;
}

// App.tsx
import Button from "./Button";
```

```ts
export default class Service {}
```

## Exemple

```ts
const config = { port: 3000 };
export default config;
```

## Comment ça fonctionne

L’import default choisit le nom local librement. Moins favorable au rename refactor automatique et parfois au tree-shaking selon les outils.

## Erreurs fréquentes

- Mélanger default et named sans convention claire
- `import { default as X }` inutilement complexe

## À retenir

- Un default max par module
- Import sans accolades
- Named souvent préférés pour les libs utilitaires

## Exercices

1. Default-exporte une fonction `main`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export default function main() {}
   ```
   :::

## Questions d'entretien

1. Named vs default exports : que préfères-tu pour une lib d’utilitaires ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Souvent les named exports : API explicite, meilleurs refactors, tree-shaking plus simple. Les default restent courants pour les composants « un fichier = un symbole principal ».
   :::
