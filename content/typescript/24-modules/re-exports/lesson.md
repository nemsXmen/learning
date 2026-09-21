---
id: typescript-24-re-exports
title: Re-exports
slug: re-exports
technology: typescript
level: intermediate
module: 24-modules
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-24-default-exports]
skills: [modules]
tags: [typescript, modules]
---

## Objectifs

- Ré-exporter des bindings
- Créer des façades de modules
- Comprendre `export ... from`

## Introduction

Un module peut **ré-exporter** les exports d’un autre module.

## Concept

```ts
// index.ts
export { add, sub } from "./math";
export { default as Button } from "./Button";
export * from "./utils";
```

## Exemple

Utile pour les barrel files et les APIs publiques stabilisées.

## Comment ça fonctionne

`export { x } from "./mod"` ré-exporte sans créer de binding local obligatoire dans le fichier courant.

## Erreurs fréquentes

- `export *` qui masque des collisions de noms
- Barrels trop gros (cycles, perf IDE)

## À retenir

- `export { ... } from`
- `export * from`
- Façades et barrels

## Exercices

1. Ré-exporte `add` depuis `./math` dans un index.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export { add } from "./math";
   ```
   :::

## Questions d'entretien

1. À quoi servent les re-exports ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À exposer une API publique stable depuis un point d’entrée (barrel / façade) sans forcer les consommateurs à connaître la structure interne des fichiers.
   :::
