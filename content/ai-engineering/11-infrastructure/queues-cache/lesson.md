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

Une queue infinie ne résout pas une surcharge durable. Il faut également une capacité bornée, du backpressure et des métriques sur l'âge et la profondeur des jobs.

:::indice
- Un worker tombe après l'action mais avant l'accusé de réception. Que prévoir ?
:::

:::solution
Le problème est l'incertitude sur l'état réel de l'action.
:::

## Erreurs fréquentes

Le flow est : API → queue → worker → result store/cache. Le worker doit être idempotent, les retries doivent utiliser un backoff borné et les échecs persistants doivent pouvoir finir dans une dead-letter queue.

## À retenir

Une clé d'idempotence et un état transactionnel permettent de reprendre sans doubler l'effet de bord ; les retries doivent rester bornés.

## Introduction

Découpler les tâches longues et contrôler la charge

## Concept

Les embeddings, imports, évaluations et générations longues ne devraient pas bloquer inutilement une requête interactive. Une queue permet de découpler le producteur du worker et d'absorber une partie des variations de charge.

## Exemple

Une tâche asynchrone doit avoir un identifiant, un état et une politique de retry. Le cache doit avoir une clé correcte, un TTL et une stratégie d'invalidation compatibles avec les données.

## Comment ça fonctionne

Un worker tombe après avoir effectué une écriture mais avant d'envoyer son ACK. Un retry aveugle peut effectuer deux fois la même action.

## Questions d'entretien

Queues et cache sont des mécanismes de fiabilité : leurs contrats d'idempotence et de cohérence doivent être explicites.

:::indice
Relie ta réponse à une métrique et à une contrainte système.
:::

:::reponse
Pourquoi l'idempotence est-elle essentielle avec les retries ?
:::
