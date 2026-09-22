---
id: typescript-23-ambient-declarations
title: Ambient declarations
slug: ambient-declarations
technology: typescript
level: intermediate
module: 23-declaration-files
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-23-introduction-aux-d-ts]
skills: [declaration-files]
tags: [typescript, ambient]
---

## Objectifs

- Comprendre les déclarations ambient
- Voir le rôle de `declare`
- Distinguer ambient global et module

## Introduction

Une **déclaration ambient** décrit quelque chose qui existe déjà à runtime (global, lib externe) sans l’implémenter.

## Concept

```ts
// global.d.ts
declare const VERSION: string;
declare function log(message: string): void;

declare namespace MyLib {
  function doSomething(): void;
}
```

## Exemple

Les libs DOM / ES sont fournies via des déclarations ambient (`lib.dom.d.ts`, etc.).

## Comment ça fonctionne

`declare` indique au compilateur : « cette chose existe, ne cherche pas d’implémentation dans ce fichier ».

## Erreurs fréquentes

- Oublier `declare` et écrire une implémentation vide trompeuse
- Polluer le scope global inutilement

## À retenir

- Ambient = décrit l’existant
- Mot-clé `declare`
- Globals, namespaces, modules externes

## Exercices

1. Déclare une constante globale `APP_NAME` de type string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   declare const APP_NAME: string;
   ```
   :::

## Questions d'entretien

1. Qu’est-ce qu’une déclaration ambient ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Une déclaration qui décrit une API ou une variable déjà présente à runtime (global, lib JS), sans fournir d’implémentation TypeScript. On utilise typiquement le mot-clé `declare`.
   :::
