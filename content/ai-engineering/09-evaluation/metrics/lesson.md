---
id: ai-09-metrics
title: "Métriques LLM et jugement automatique"
slug: metrics
technology: ai-engineering
level: advanced
module: evaluation
order: 2
estimatedMinutes: 75
difficulty: 5
xp: 170
prerequisites: [ai-09-eval-design]
skills: [ai-evaluation]
tags: [evaluation, metrics, llm]
---

## Objectifs
- choisir une métrique adaptée ;
- comprendre précision, rappel et taux d'erreur ;
- utiliser un judge avec prudence ;
- suivre latence et coût.

## Métriques
Classification : precision, recall, F1. Extraction : exact match ou validation de schéma. RAG : recall@k et groundedness. Système : latence, erreurs, tokens et coût.

## LLM-as-judge
Un autre modèle peut noter une réponse selon une rubrique. Mais il peut être biaisé par formulation, longueur ou préférence de modèle.

```text
metric = quality + reliability + cost + latency
```

## Exercice
Une réponse est parfaite mais coûte dix fois plus cher. Quelle mesure manque ?

:::indice
Choisis une métrique liée au risque et vérifie les segments avant la moyenne globale.
:::

:::solution
Le tableau d'évaluation doit intégrer le coût par requête ou par tâche, avec une mesure de qualité comparable.

:::

## À retenir
Aucune métrique unique ne résume un système LLM.


## Introduction

Les métriques doivent correspondre au risque réel du système.

## Concept

Exact match, précision, rappel, groundedness, latence et coût ne mesurent pas la même chose.

## Exemple

Un système de classification sensible peut privilégier le rappel alors qu'une autre tâche privilégie la précision.

## Comment ça fonctionne

outputs → metrics → segments → thresholds

## Questions d'entretien

- Pourquoi segmenter les métriques ?

  :::indice
  Une bonne métrique doit être reliée à une décision.
  :::

  :::reponse
  Une moyenne peut masquer une régression importante sur une population ou un type de requête.
  :::
