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

## Exercices

Une moyenne globale peut masquer une régression sur une langue, une intention ou un tenant. Segmente donc les résultats selon les risques importants avant de conclure.

:::indice
- Une réponse est parfaite mais coûte dix fois plus cher. Quelle mesure manque ?
:::

:::solution
Cherche la contrainte opérationnelle absente du tableau.
:::

## Erreurs fréquentes

Le flow est : outputs → métriques → segmentation → seuils → décision. Un LLM-as-judge peut évaluer des propriétés difficiles à formaliser, mais il doit lui aussi être testé pour biais de longueur, formulation ou préférence de modèle.

## À retenir

Le coût par requête ou par tâche doit être mesuré avec une qualité comparable, ainsi que la latence si elle affecte l'expérience.

## Introduction

Choisir des métriques qui expliquent réellement le système

## Concept

Il n'existe pas une métrique universelle pour un système LLM. Une classification, une extraction JSON, un RAG et un chatbot n'ont pas les mêmes critères de réussite.

## Exemple

Precision, recall et F1 répondent à des questions différentes. Exact match convient à certaines sorties exactes ; la validation de schéma vérifie une structure ; recall@k évalue le retrieval ; groundedness examine le support des affirmations. Latence, erreurs, tokens et coût complètent la vue système.

## Comment ça fonctionne

Une réponse peut être parfaite mais dix fois plus chère. Si l'équipe ne mesure que la qualité, elle ignore une contrainte opérationnelle essentielle. Inversement, une baisse de coût n'est utile que si la qualité reste acceptable.

## Questions d'entretien

Les métriques servent à prendre des décisions ; elles doivent être reliées au risque réel et analysées par segment.

:::indice
Relie ta réponse à une décision concrète de qualité, coût ou release.
:::

:::reponse
Pourquoi segmenter les métriques ?
:::
