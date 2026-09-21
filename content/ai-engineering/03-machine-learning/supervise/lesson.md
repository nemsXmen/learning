---
id: ai-ml-supervised
title: "Machine Learning supervisé"
slug: supervise
technology: ai-engineering
level: beginner
module: machine-learning
order: 1
estimatedMinutes: 55
difficulty: 3
xp: 120
prerequisites: [ai-maths-fondations, ai-data-quality]
skills: [ai-ml-basics]
tags: [machine-learning, supervised, classification, regression]
---

## Objectifs

- distinguer régression et classification ;
- comprendre features, labels et fonction de perte ;
- construire une baseline ;
- interpréter les erreurs.

## Cadre

En supervisé, on observe des exemples (x, y) et cherche une fonction f(x) qui généralise à des exemples non vus. x représente les features et y la cible.

Deux grandes familles : régression pour une cible numérique et classification pour des catégories.

## Baseline

Commence par un modèle simple. Une baseline vérifie que données, labels et métriques fonctionnent avant un modèle complexe.

## Classification

Pour une classification binaire, le modèle produit souvent un score ou une probabilité puis applique un seuil.

La matrice de confusion distingue vrais positifs, faux positifs, vrais négatifs et faux négatifs.

Precision = TP / (TP + FP)

Recall = TP / (TP + FN)

Le choix dépend du coût des erreurs.

## Régression

MAE mesure l'erreur absolue moyenne. RMSE amplifie davantage les grosses erreurs. La métrique doit correspondre au coût métier.

## Exercice

Pour un filtre anti-spam, explique pourquoi recall seul ne suffit pas.

:::indice
Commence par définir la métrique et la baseline avant de choisir une technique.
:::

:::solution

Un recall élevé peut augmenter les faux positifs. Mesure aussi precision et inspecte les erreurs selon leur coût utilisateur.

:::

## À retenir

Le ML supervisé relie données, cible, modèle, métrique et décision. Le choix de l'algorithme vient après la définition correcte de cette chaîne.


## Introduction

Le ML supervisé apprend une relation entre entrées et cibles connues.

## Concept

Régression et classification utilisent des fonctions de perte adaptées au type de cible.

## Exemple

Une classification binaire peut comparer précision, rappel et coût des faux négatifs.

## Comment ça fonctionne

données labellisées → split → entraînement → validation → prédiction

## Questions d'entretien

- Pourquoi commencer par une baseline ?

  :::indice
  Pense au risque de mesure trompeuse et à la généralisation.
  :::

  :::reponse
  Elle fournit une référence simple pour mesurer la valeur réelle du modèle.
  :::
