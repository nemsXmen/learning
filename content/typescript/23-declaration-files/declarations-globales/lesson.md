---
id: typescript-23-declarations-globales
title: Déclarations globales
slug: declarations-globales
technology: typescript
level: intermediate
module: 23-declaration-files
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-23-declare]
skills: [declaration-files]
tags: [typescript, global]
---

## Objectifs

- Déclarer des globals typés
- Étendre le scope global
- Utiliser `declare global`

## Introduction

Certaines APIs vivent dans le scope global (`window`, variables injectées, etc.).

## Concept

```ts
// global.d.ts (script, pas de import/export)
declare const APP_CONFIG: { apiUrl: string };

interface Window {
  analytics?: { track(event: string): void };
}
```

Dans un module :

```ts
declare global {
  interface Window {
    myApp: { version: string };
  }
}
export {}; // force module
```

## Exemple

Augmenter `Window` ou `NodeJS.Global` pour des injections runtime.

## Comment ça fonctionne

Sans `import`/`export`, un `.d.ts` est un script ambient global. Avec, il faut `declare global` pour toucher au scope global.

## Erreurs fréquentes

- Oublier `export {}` quand on veut un module + declare global
- Conflits de noms globaux

## À retenir

- Globals via declare ou interface Window
- `declare global` dans les modules
- Minimalisme : éviter le global si un module suffit

## Exercices

1. Ajoute `myFeature: boolean` sur Window via declare global.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   declare global {
     interface Window {
       myFeature: boolean;
     }
   }
   export {};
   ```
   :::

## Questions d'entretien

1. Comment types-tu une variable injectée sur `window` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En augmentant l’interface `Window` (dans un .d.ts global ou via `declare global` dans un module), pour que `window.myProp` soit reconnu par TypeScript.
   :::
