---
id: ai-11-serving
title: "Model serving et inference"
slug: serving
technology: ai-engineering
level: advanced
module: 11-infrastructure
order: 2
estimatedMinutes: 80
difficulty: 5
xp: 170
prerequisites: [ai-11-gpu]
skills: [ai-engineering]
tags: [ai, production, engineering]
---

## Objectifs
- exposer un modèle comme service ;
- comprendre batching et concurrence ;
- gérer timeouts et backpressure ;
- mesurer throughput et latence.

## Service
```text
client -> API -> queue/batcher -> model server -> response
```

Un serveur d'inférence doit contrôler concurrence, taille des requêtes et durée maximale.

## Throughput vs latency
Batching augmente souvent le débit mais peut ajouter de l'attente. Mesure p50, p95 et p99 au lieu d'une moyenne seule.

## Backpressure
Si la demande dépasse la capacité, une queue bornée et des réponses de surcharge protègent le système.

## Exercice
La latence p99 explose pendant les pics. Quelle hypothèse tester ?

### Solution
Vérifier saturation GPU, file d'attente, batching, concurrence et temps de prétraitement séparément.

## À retenir
Servir un modèle est un problème de système distribué, pas seulement un appel de fonction.
