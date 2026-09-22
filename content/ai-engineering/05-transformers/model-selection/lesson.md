---
id: ai-05-model-selection
title: "Sélection et benchmark des modèles"
slug: model-selection
technology: ai-engineering
level: intermediate
module: transformers
order: 4
estimatedMinutes: 55
difficulty: 4
xp: 130
prerequisites: [ai-05-llm-architecture]
skills: [ai-transformers]
tags: [transformers, llm]
---

## Objectifs
- choisir un modèle selon une tâche et des contraintes ;
- distinguer qualité, latence, coût et contexte ;
- comprendre local, API et modèles spécialisés ;
- construire un protocole de comparaison reproductible.

## Les critères
Pour sélectionner un modèle, mesure séparément :

- qualité sur les tâches réelles ;
- latence p50/p95 ;
- coût par requête ou par million de tokens ;
- longueur de contexte utile ;
- contraintes de confidentialité ;
- disponibilité et limites de débit ;
- capacités de tool calling ou sortie structurée ;
- facilité d'exploitation.

Il n'existe pas de modèle universellement optimal pour toutes les applications.

## Benchmark applicatif
Un benchmark utile contient des exemples représentatifs de production, des critères définis avant le test et des cas difficiles.

```text
dataset -> même prompts -> modèles -> mêmes métriques -> rapport
```

Ne compare pas deux modèles avec des prompts, paramètres ou budgets différents sans le documenter.

## Modèle local vs API
Un modèle local donne davantage de contrôle sur les données et l'infrastructure, mais impose matériel, déploiement et maintenance.

Une API réduit l'effort opérationnel mais introduit dépendance fournisseur, coûts variables et contraintes de données.

## Context window
Une grande fenêtre ne signifie pas automatiquement meilleure compréhension. Teste la récupération d'information à différentes positions et longueurs.

## Modèles spécialisés
Pour certaines tâches, un petit modèle spécialisé peut être plus adapté qu'un modèle généraliste : classification, extraction structurée, reranking ou génération très contrainte.

## Exercices
Une application reçoit 100 000 requêtes par jour. Quelles dimensions mesurer avant de choisir un modèle ?

:::indice
Relie le concept à la chaîne tokens → représentation → modèle → sortie.
:::

:::solution
Mesurer qualité sur données réelles, coût total, p50/p95 de latence, taux d'erreur, limites de débit, consommation de tokens, exigences de confidentialité et capacité à respecter le contrat de sortie.

:::

## À retenir
Le choix de modèle est une décision d'ingénierie mesurable. Commence par les contraintes et les tâches réelles, puis benchmarke.


## Introduction

Choisir un modèle est une décision système autant qu'une décision de qualité.

## Concept

Qualité, contexte, latence, coût, confidentialité, outils et contraintes de déploiement doivent être comparés.

## Exemple

Un petit modèle spécialisé peut être préférable à un modèle général très coûteux sur une tâche étroite.

## Comment ça fonctionne

besoin → candidats → benchmark → coût/latence → choix contrôlé

## Questions d'entretien

- Pourquoi un benchmark interne est-il nécessaire ?

  :::indice
  Pense au lien entre comportement du modèle et contraintes de production.
  :::

  :::reponse
  Parce que les performances générales ne garantissent pas le comportement sur les tâches réelles du produit.
  :::
