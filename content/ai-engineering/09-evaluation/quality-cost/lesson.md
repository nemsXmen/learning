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

Optimiser avant de mesurer conduit facilement à une fausse économie. Une baisse de coût qui augmente les erreurs critiques peut être plus coûteuse pour le produit qu'elle ne l'est dans la facture fournisseur.

:::indice
- Une fonctionnalité utilise un modèle premium pour toutes les requêtes. Quelle démarche ?
:::

:::solution
Ne remplace pas directement le modèle : commence par segmenter les tâches.
:::

## Erreurs fréquentes

Le flow est : requête → classification/routing → modèle → mesure qualité/coût/latence → comparaison avec baseline. Chaque optimisation doit isoler autant que possible une variable afin de comprendre son effet.

## À retenir

Définir le niveau de qualité minimal, segmenter les cas et tester un modèle moins coûteux sur les segments compatibles, puis comparer qualité, latence et coût.

## Introduction

Optimiser sans détruire la qualité

## Concept

L'optimisation d'une application AI est un problème multi-objectifs : qualité, latence, coût et parfois consommation mémoire ou taux d'erreur évoluent ensemble.

## Exemple

Les leviers sont différents : réduire le contexte inutile agit sur tokens et latence ; le cache réduit certains appels ; le routing choisit un modèle adapté ; les retries doivent rester bornés ; le batching peut améliorer le débit.

## Comment ça fonctionne

Une application de support peut utiliser un modèle léger pour les demandes simples et réserver un modèle plus coûteux aux cas complexes. Mais cette décision doit être validée sur le même dataset d'évaluation.

## Questions d'entretien

L'optimisation doit être mesurée contre une baseline et considérée comme un arbitrage multi-objectifs.

:::indice
Relie ta réponse à une décision concrète de qualité, coût ou release.
:::

:::reponse
Pourquoi mesurer le coût par tâche plutôt que seulement par requête ?
:::
