---
id: typescript-26-pourquoi-typescript-ne-valide-pas-le-runtime
title: Pourquoi TypeScript ne valide pas le runtime ?
slug: pourquoi-typescript-ne-valide-pas-le-runtime
technology: typescript
level: intermediate
module: 26-typescript-and-javascript-runtime
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-26-reponses-d-api]
skills: [runtime]
tags: [typescript, runtime]
---

## Objectifs

- Comprendre le choix de design de TypeScript
- Voir les implications
- Savoir quoi ajouter soi-même

## Introduction

TypeScript est un **superset orienté développeur et compile-time**, pas un système de validation runtime.

## Concept

Raisons principales :
1. **Type erasure** — modèle simple, compatible JS
2. **Coût runtime** — valider partout serait cher et invasif
3. **Philosophie** — rester proche de JavaScript
4. **Écosystème** — laisser la validation à des libs dédiées

## Exemple

TS + Zod / Valibot / io-ts / Yup = duo classique.

## Comment ça fonctionne

Le compilateur garantit la cohérence **interne** du code typé. Les bords du système restent ta responsabilité.

## Erreurs fréquentes

- Attendre de TS qu’il « protège la prod » seul
- Aucune validation aux frontières

## À retenir

- TS ≠ validateur runtime
- Choix volontaire (erasure, perf, JS)
- Ajouter validation aux bords
- Types + schemas = stack complète

## Exercices

1. En une phrase : que garantit TS, et que dois-tu garantir toi-même ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   TS garantit la cohérence compile-time du code typé ; tu garantis la forme des données externes à runtime via validation.
   :::

## Questions d'entretien

1. Pourquoi TypeScript n’inclut-il pas de validation runtime native ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Par design : type erasure, proximité avec JavaScript, et volonté de ne pas imposer de coût runtime. La validation est déléguée à des bibliothèques et au code applicatif aux frontières.
   :::
