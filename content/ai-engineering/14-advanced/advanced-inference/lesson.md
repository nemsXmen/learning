---
id: ai-14-advanced-inference
title: "Inference avancée et systèmes à haute performance"
slug: advanced-inference
technology: ai-engineering
level: advanced
module: 14-advanced
order: 4
estimatedMinutes: 90
difficulty: 5
xp: 200
prerequisites: [ai-14-multimodal]
skills: [ai-advanced]
tags: [fine-tuning, inference, multimodal, optimization]
---

## Objectifs
- raisonner sur throughput et tail latency ;
- comprendre batching dynamique ;
- choisir cache et parallélisme ;
- dimensionner un service d'inférence.

## Performance
Mesure temps jusqu'au premier token, temps total, tokens/seconde, concurrence et p95/p99.

```text
requests -> scheduler -> dynamic batching -> GPU workers -> streams
```

## KV cache
Pour les modèles autoregressifs, le cache d'attention peut réduire le recalcul mais consomme de la mémoire. Sa gestion devient importante avec longs contextes et forte concurrence.

## Scalabilité
Scale horizontalement lorsque la charge et les contraintes de mémoire le justifient. Un autoscaling mal calibré peut provoquer des cold starts et coûts excessifs.

## Exercice
Le throughput augmente mais p99 devient mauvais après activation du batching. Quelle analyse ?

### Solution
Mesurer taille des batches, attente du scheduler, distribution de longueur des requêtes et saturation GPU.

## À retenir
L'inférence avancée est une optimisation de système complète, pas seulement un choix de GPU.


## Introduction

L'inférence avancée optimise un système complet sous contrainte de concurrence.

## Concept

KV cache, batching dynamique, scheduler et parallélisme influencent throughput et tail latency.

## Exemple

Un batching plus grand peut améliorer le throughput tout en augmentant le temps d'attente individuel.

## Comment ça fonctionne

requests → scheduler → batching → GPU → streaming

## Questions d'entretien

- Pourquoi suivre p99 après optimisation ?

  :::indice
  Pense en compromis mesurables plutôt qu'en optimisation absolue.
  :::

  :::reponse
  Une optimisation de throughput peut dégrader fortement les requêtes les plus lentes.
  :::
