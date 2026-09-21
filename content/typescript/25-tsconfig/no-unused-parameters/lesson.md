---
id: typescript-25-no-unused-parameters
title: noUnusedParameters
slug: no-unused-parameters
technology: typescript
level: intermediate
module: 25-tsconfig
order: 12
estimatedMinutes: 8
difficulty: 1
xp: 30
prerequisites: [typescript-25-no-unused-locals]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Activer `noUnusedParameters`
- Détecter les paramètres non utilisés
- Gérer les args volontairement ignorés

## Introduction

Signale les paramètres de fonction jamais lus.

## Concept

```ts
function f(x: number, y: number) {
  return x; // y inutilisé → erreur
}
```

Convention courante : préfixer par `_` (`_y`) pour indiquer un ignore volontaire (selon config ESLint / TS).

## Exemple

Callbacks où certains args ne sont pas nécessaires.

## Comment ça fonctionne

Comme noUnusedLocals, mais ciblé sur les paramètres.

## Erreurs fréquentes

- Supprimer un paramètre requis par une signature (interface) au lieu de le préfixer

## À retenir

- Params non lus = erreur
- `_` pour ignore intentionnel
- Signatures d’interface respectées

## Exercices

1. Garde un second paramètre non utilisé de façon conventionnelle.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function f(x: number, _y: number) {
     return x;
   }
   ```
   :::

## Questions d'entretien

1. Comment gères-tu un paramètre imposé par une interface mais non utilisé ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En le gardant pour respecter la signature et en le préfixant souvent par `_` pour signaler l’ignore volontaire, selon les conventions du projet.
   :::
