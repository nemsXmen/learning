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
La latence p99 explose pendant les pics. Quelles hypothèses tester ?

:::indice
Mesure mémoire, débit, latence et concurrence avant de conclure à une optimisation.
:::

:::solution
Vérifier saturation GPU, file d'attente, batching, concurrence et temps de prétraitement séparément.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
Servir un modèle est un problème de système distribué.


## Introduction

Servir un modèle exige de gérer concurrence, batching, streaming et tail latency.

## Concept

p50, p95 et p99 décrivent des expériences différentes.

## Exemple

Un service peut avoir un bon temps moyen mais un p99 très élevé sous forte concurrence.

## Comment ça fonctionne

requests → scheduler → workers → response → metrics

## Questions d'entretien

- Pourquoi suivre p99 ?

  :::indice
  Relie performance et fiabilité au comportement sous charge.
  :::

  :::reponse
  Parce que les utilisateurs les plus lents subissent souvent les files d'attente et saturations.
  :::
