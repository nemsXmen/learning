---
id: ai-11-queues-cache
title: "Queues, cache et tâches asynchrones"
slug: queues-cache
technology: ai-engineering
level: advanced
module: 11-infrastructure
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

## Exercice
Un worker tombe après l'action mais avant l'accusé de réception. Que prévoir ?

### Solution
Une clé d'idempotence et un état transactionnel permettent de reprendre sans doubler l'effet de bord.

## À retenir
Queues et cache nécessitent des contrats d'idempotence et de cohérence.
