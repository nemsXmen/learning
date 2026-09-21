---
id: typescript-25-no-implicit-returns
title: noImplicitReturns
slug: no-implicit-returns
technology: typescript
level: intermediate
module: 25-tsconfig
order: 10
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-25-exact-optional-property-types]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Activer `noImplicitReturns`
- Garantir un return sur tous les chemins
- Éviter les undefined implicites

## Introduction

Avec `noImplicitReturns`, tous les chemins d’une fonction avec type de retour doivent retourner une valeur.

## Concept

```ts
// Erreur si noImplicitReturns
function f(x: number): number {
  if (x > 0) return x;
  // manque return
}
```

## Exemple

Force l’exhaustivité des branches.

## Comment ça fonctionne

Le compilateur vérifie que chaque chemin retourne une valeur compatible avec le type de retour déclaré.

## Erreurs fréquentes

- Branches if sans else oubliées

## À retenir

- Tous les chemins retournent
- Complète bien le control-flow analysis
- Qualité de fonctions

## Exercices

1. Corrige une fonction number qui ne retourne que dans un if.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function f(x: number): number {
     if (x > 0) return x;
     return 0;
   }
   ```
   :::

## Questions d'entretien

1. Que vérifie `noImplicitReturns` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Que chaque chemin d’exécution d’une fonction avec type de retour explicite retourne effectivement une valeur, évitant les retours undefined implicites.
   :::
