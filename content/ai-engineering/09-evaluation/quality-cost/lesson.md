---
id: ai-09-quality-cost
title: "Optimiser qualité, coût et latence"
slug: quality-cost
technology: ai-engineering
level: advanced
module: 09-evaluation
order: 3
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-09-metrics]
skills: [ai-evaluation]
tags: [evaluation, metrics, llm]
---

## Objectifs
- analyser les compromis ;
- réduire tokens et appels ;
- choisir le bon modèle par tâche ;
- mesurer avant optimisation.

## Leviers
Réduire contexte inutile, mettre en cache les requêtes sûres, router vers un modèle adapté et limiter les retries.

```text
quality
  / /  cost--latency
```

Ne dégrade pas silencieusement la qualité pour gagner quelques millisecondes. Compare sur le même dataset.

## Exercice
Une fonctionnalité utilise un modèle premium pour toutes les requêtes. Quelle démarche ?

### Solution
Segmenter les tâches, mesurer la qualité minimale requise et tester un modèle moins coûteux sur les cas compatibles.

## À retenir
L'optimisation est un problème multi-objectifs mesuré.
