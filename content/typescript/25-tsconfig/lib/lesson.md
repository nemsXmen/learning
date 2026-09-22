---
id: typescript-25-lib
title: lib
slug: lib
technology: typescript
level: intermediate
module: 25-tsconfig
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-25-module-resolution]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Configurer `lib`
- Inclure les types d’API (ES, DOM…)
- Ne pas confondre avec target

## Introduction

`lib` sélectionne les **bibliothèques de types** disponibles au type-checking.

## Concept

```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

Sans `lib`, TypeScript en déduit souvent une valeur par défaut selon `target`.

## Exemple

Backend Node pur : parfois `["ES2022"]` sans DOM. Frontend : DOM + ES.

## Comment ça fonctionne

`lib` n’émet pas de polyfills : il expose seulement les types (Promise, Array methods, document…).

## Erreurs fréquentes

- Inclure DOM dans un projet Node purement serveur
- Oublier une lib et voir des erreurs sur des APIs standards

## À retenir

- `lib` = types d’API
- Pas de polyfill automatique
- Adapter à l’environnement

## Exercices

1. Configure lib pour un front ES2020 + DOM.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "lib": ["ES2020", "DOM"] } }
   ```
   :::

## Questions d'entretien

1. `lib` ajoute-t-il des polyfills au runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non. Il fournit uniquement les déclarations de types pour le type-checking. Les polyfills restent une responsabilité runtime (core-js, etc.).
   :::
