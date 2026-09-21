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
prerequisites: [ai-probability, ai-data-quality]
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

### Solution

Un recall élevé peut augmenter les faux positifs. Mesure aussi precision et inspecte les erreurs selon leur coût utilisateur.

## À retenir

Le ML supervisé relie données, cible, modèle, métrique et décision. Le choix de l'algorithme vient après la définition correcte de cette chaîne.
