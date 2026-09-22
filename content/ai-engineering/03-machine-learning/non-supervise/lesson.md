---
id: ai-ml-unsupervised
title: "Machine Learning non supervisé"
slug: non-supervise
technology: ai-engineering
level: intermediate
module: machine-learning
order: 2
estimatedMinutes: 50
difficulty: 3
xp: 110
prerequisites: [ai-ml-supervised]
skills: [ai-ml-basics]
tags: [clustering, dimensionality-reduction, anomaly]
---

## Objectifs

- comprendre clustering et réduction de dimension ;
- distinguer exploration et prédiction ;
- détecter des anomalies avec prudence ;
- valider un cluster avec le contexte métier.

## Clustering

K-means cherche des centroïdes minimisant la distance intra-cluster. Le nombre de clusters est un choix de modélisation, pas une vérité automatiquement découverte.

Les groupes doivent être interprétés avec leurs caractéristiques et leur stabilité.

## Réduction de dimension

PCA projette les données vers des directions expliquant une partie de la variance. Une projection 2D aide à visualiser mais ne prouve pas que la structure réelle est bidimensionnelle.

## Anomalies

Une observation inhabituelle n'est pas nécessairement une fraude ou une erreur. Distingue détection statistique et interprétation métier.

## Embeddings

Les embeddings permettent aussi regroupement et recherche sémantique. Le résultat dépend du modèle, des données et de la métrique.

## Exercices

Tu observes trois clusters de clients. Comment vérifier qu'ils sont utiles ?

:::indice
Commence par définir la métrique et la baseline avant de choisir une technique.
:::

:::solution

Comparer stabilité, caractéristiques, séparation selon plusieurs métriques et utilité pour une décision réelle. Ne pas conclure uniquement depuis une visualisation.

:::

## À retenir

Le non supervisé sert à explorer et représenter. Une structure calculée doit être confrontée aux données et au contexte avant utilisation.


## Introduction

L'apprentissage non supervisé cherche des structures sans cible fournie.

## Concept

Clustering, réduction de dimension et détection d'anomalies répondent à des objectifs différents.

## Exemple

K-means regroupe des points autour de centroïdes mais son résultat dépend du choix de k et de l'échelle.

## Comment ça fonctionne

données → représentation → algorithme → analyse → validation métier

## Questions d'entretien

- Pourquoi normaliser certaines features avant clustering ?

  :::indice
  Pense au risque de mesure trompeuse et à la généralisation.
  :::

  :::reponse
  Parce que les distances seraient sinon dominées par les variables à grande échelle.
  :::
