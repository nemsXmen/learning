---
id: typescript-34-donnees-externes
title: Données externes
slug: 34-donnees-externes
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 1
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: []
skills: [validation]
tags: [typescript, validation]
---

## Objectifs

- Identifier les frontières de données externes
- Comprendre le risque de confiance aveugle
- Préparer le terrain à la validation

## Introduction

Tout ce qui entre dans ton process depuis **l’extérieur** est non fiable pour le type-checker.

## Concept

Sources externes typiques :
- JSON d’API HTTP
- body / query / params
- variables d’environnement
- fichiers, queues, webhooks
- localStorage / bases de données

```ts
const data = await res.json(); // unknown en pratique
```

## Exemple

Même si tu annotes `as User`, le runtime peut envoyer n’importe quoi.

## Comment ça fonctionne

TypeScript efface les types : rien ne vérifie la forme réelle à l’exécution sans code de validation.

## Erreurs fréquentes

- `as User` sur json()
- Faire confiance au front ou à un partenaire API

## À retenir

- Externe = non fiable
- Frontières à valider
- Types ≠ garanties runtime

## Exercices

1. Cite 3 sources de données externes.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   API HTTP, process.env, body de requête, localStorage, fichiers…
   :::

## Questions d'entretien

1. Pourquoi les données d’une API ne sont-elles pas « déjà typées » ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que TypeScript n’existe plus à runtime et que le producteur peut envoyer une forme différente. Seule une validation runtime garantit la structure.
   :::
