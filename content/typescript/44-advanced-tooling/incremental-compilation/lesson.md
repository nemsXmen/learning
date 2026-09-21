---
id: typescript-44-incremental-compilation
title: Incremental compilation
slug: incremental-compilation
technology: typescript
level: intermediate
module: 44-advanced-tooling
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-44-ci-type-checking]
skills: [tooling]
tags: [typescript, tooling]
---

## Objectifs

- Activer incremental
- tsbuildinfo
- Limites

## Introduction

La compilation **incrémentale** réutilise le travail précédent.

## Concept

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

## Exemple

`tsc -b` avec project references tire parti de l’incrémental multi-projets.

## Comment ça fonctionne

tsbuildinfo stocke un graphe d’infos pour éviter de tout recomputer.

## Erreurs fréquentes

- Committer tsbuildinfo par erreur (souvent gitignored)
- Cache corrompu → clean rebuild

## À retenir

- incremental true
- tsbuildinfo
- Clean si doute

## Exercices

1. Fichier produit par incremental ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `.tsbuildinfo` (ou chemin custom).
   :::

## Questions d'entretien

1. À quoi sert incremental compilation ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À accélérer les compilations successives en réutilisant des informations persistées (tsbuildinfo) plutôt que tout recommencer à zéro.
   :::
