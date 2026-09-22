---
id: typescript-26-donnees-externes
title: Données externes
slug: donnees-externes
technology: typescript
level: intermediate
module: 26-typescript-and-javascript-runtime
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-26-unknown-aux-frontieres]
skills: [runtime]
tags: [typescript, runtime]
---

## Objectifs

- Identifier les sources de données externes
- Appliquer une stratégie unique de validation
- Documenter les frontières du système

## Introduction

Tout ce qui **entre** dans le système hors de ton code compilé est externe.

## Concept

Sources typiques :
- Réponses HTTP / WebSocket
- localStorage / sessionStorage
- Query params / formulaires
- Fichiers, env vars
- Messages postMessage / workers
- Libs JS non typées

Stratégie :
1. Typer l’entrée `unknown`
2. Valider (schema / guard)
3. Travailler en types internes sûrs

## Exemple

```ts
const raw = localStorage.getItem("user");
const data: unknown = raw ? JSON.parse(raw) : null;
const user = UserSchema.parse(data);
```

## Comment ça fonctionne

On centralise la validation aux bords pour que le cœur métier manipule des types déjà sûrs.

## Erreurs fréquentes

- Valider au milieu du domaine (trop tard)
- Faire confiance au « backend de confiance » sans contrat

## À retenir

- Externe = non fiable pour TS
- Valider aux bords
- Domaine en types internes

## Exercices

1. Liste 3 sources de données externes dans une app web.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   fetch API, localStorage, query string / inputs formulaire.
   :::

## Questions d'entretien

1. Où places-tu la validation dans une architecture TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Aux frontières du système (adapters HTTP, storage, UI inputs), pour que le domaine manipule uniquement des données déjà validées et typées.
   :::
