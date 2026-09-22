---
id: ai-11-serving
title: "Model serving et inference"
slug: serving
technology: ai-engineering
level: advanced
module: infrastructure
order: 2
estimatedMinutes: 80
difficulty: 5
xp: 170
prerequisites: [ai-11-gpu]
skills: [ai-infrastructure]
tags: [infrastructure, inference, ai]
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

Un serveur d'inférence contrôle concurrence, taille des requêtes et durée maximale.

## Throughput vs latency
Le batching peut augmenter le débit mais ajouter de l'attente. Mesure p50, p95 et p99.

## Backpressure
Une queue bornée et des réponses de surcharge protègent le système lorsque la demande dépasse la capacité.

## Exercices
- Le batching augmente souvent le throughput, mais peut augmenter la latence. Mesure p50, p95 et p99 séparément et observe aussi le temps passé en queue.

:::indice
- La latence p99 explose pendant les pics. Quelles hypothèses tester ?
:::
:::solution
Sépare queue, prétraitement et calcul modèle.
:::
## Erreurs fréquentes

Le flow est : requêtes → admission → scheduler/batcher → workers GPU → réponse → métriques. Une queue bornée et une politique de surcharge évitent qu'une saturation se transforme en cascade failure.

## À retenir

Vérifier saturation GPU, profondeur de queue, batching, concurrence, prétraitement et temps de réponse du modèle séparément.

## Introduction

Transformer un modèle en service fiable

## Concept

Servir un modèle n'est pas seulement exposer une fonction HTTP. Il faut gérer concurrence, files d'attente, batching, timeouts, streaming, saturation et observation de la tail latency.

## Exemple

Le serveur d'inférence reçoit une requête, prépare les entrées, planifie le calcul puis renvoie le résultat. La capacité réelle dépend du coût par requête et du nombre de requêtes simultanées.

## Comment ça fonctionne

Un service peut avoir une moyenne de 400 ms tout en ayant un p99 de plusieurs secondes lors d'un pic. Les requêtes lentes peuvent attendre dans la queue avant même d'entrer sur le GPU.

## Questions d'entretien
- Le model serving est un problème de système distribué autant qu'un problème ML.

:::indice
Relie ta réponse à une métrique et à une contrainte système.
:::
:::reponse
Pourquoi suivre p99 ?
:::