---
id: ai-09-quality-cost
title: "Optimiser qualité, coût et latence"
slug: quality-cost
technology: ai-engineering
level: advanced
module: evaluation
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

## Exercices
- Une fonctionnalité utilise un modèle premium pour toutes les requêtes. Quelle démarche ?

:::indice
Choisis une métrique liée au risque et vérifie les segments avant la moyenne globale.
:::

:::solution
Segmenter les tâches, mesurer la qualité minimale requise et tester un modèle moins coûteux sur les cas compatibles.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
L'optimisation est un problème multi-objectifs mesuré.


## Introduction

Optimiser une application AI revient à arbitrer qualité, latence et coût.

## Concept

Réduire contexte, choisir un modèle adapté, cacher certaines réponses ou router les requêtes sont des leviers distincts.

## Exemple

Un modèle coûteux peut être réservé aux cas complexes tandis qu'un modèle plus léger traite les requêtes simples.

## Comment ça fonctionne

request → routing → model → quality/cost measurement

## Questions d'entretien

- Pourquoi mesurer le coût par tâche plutôt que seulement par requête ?

  :::indice
  Une bonne métrique doit être reliée à une décision.
  :::

  :::reponse
  Parce qu'une tâche peut déclencher plusieurs appels, retrievals et retries.
  :::
