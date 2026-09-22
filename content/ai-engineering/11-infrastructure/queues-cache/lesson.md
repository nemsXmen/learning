---
id: ai-11-queues-cache
title: "Queues, cache et tâches asynchrones"
slug: queues-cache
technology: ai-engineering
level: advanced
module: infrastructure
order: 3
estimatedMinutes: 75
difficulty: 4
xp: 160
prerequisites: [ai-11-serving]
skills: [ai-infrastructure]
tags: [infrastructure, inference, ai]
---

## Objectifs
- déplacer les tâches longues hors requête ;
- choisir une stratégie de cache ;
- gérer retries et idempotence ;
- éviter les files infinies.

## Async
Génération longue, ingestion et embeddings peuvent être exécutés en arrière-plan.

```text
API -> queue -> worker -> result store
          |       |
       retry    idempotency
```

## Cache
Définis TTL, invalidation et clé tenant-safe. Ne mets pas en cache un résultat sensible sans isoler les tenants.

## Retry
Utilise backoff et nombre maximal d'essais. Une tâche non idempotente ne doit pas être rejouée aveuglément.

## Exercices
Un worker tombe après l'action mais avant l'accusé de réception. Que prévoir ?

:::indice
Mesure mémoire, débit, latence et concurrence avant de conclure à une optimisation.
:::

:::solution
Une clé d'idempotence et un état transactionnel permettent de reprendre sans doubler l'effet de bord.

:::

## À retenir
Queues et cache nécessitent des contrats d'idempotence et de cohérence.


## Introduction

Queues et cache découplent tâches lentes et requêtes interactives.

## Concept

Idempotence, retry et dead-letter handling sont essentiels aux workers.

## Exemple

Un job d'embedding peut être rejoué sans créer de doublons si son identifiant est idempotent.

## Comment ça fonctionne

API → queue → worker → result/cache

## Questions d'entretien

- Pourquoi l'idempotence est-elle essentielle avec les retries ?

  :::indice
  Relie performance et fiabilité au comportement sous charge.
  :::

  :::reponse
  Pour qu'une même tâche ne provoque pas plusieurs effets de bord.
  :::
