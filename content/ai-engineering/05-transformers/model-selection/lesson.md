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

Choisir un modèle selon une tâche réelle et comparer qualité, latence, coût, contexte, confidentialité et capacités d'intégration.

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

- Une application reçoit 100 000 requêtes par jour. Quelles dimensions mesurer avant de choisir un modèle ?

:::indice
Sépare qualité, performance opérationnelle, coût et contraintes produit.
:::

:::solution
Qualité réelle, coût total, p50/p95, taux d'erreur, tokens consommés, limites de débit, confidentialité et respect du contrat de sortie.
:::

## Erreurs fréquentes

Une grande fenêtre de contexte ne garantit pas une meilleure compréhension. Teste aussi la récupération d'information à différentes positions. De même, ne choisis pas un modèle uniquement sur un benchmark public si les données de ton produit sont différentes.

## À retenir

Le choix de modèle est une décision d'ingénierie mesurable. Commence par les contraintes réelles, puis benchmarke.

## Introduction

Le meilleur modèle abstrait n'est pas nécessairement celui qui convient à ton application. Une application de support, une extraction JSON et une génération de code n'ont pas les mêmes contraintes.

## Concept

Commence par définir les tâches et contraintes. Mesure ensuite qualité, p50/p95 de latence, coût, contexte utile, taux d'erreur, limites de débit, confidentialité, tool calling et sortie structurée.

## Exemple

Construis un dataset représentatif de la production. Envoie les mêmes cas, avec le même protocole, aux candidats puis compare les mêmes métriques. Les cas difficiles sont particulièrement importants car une moyenne peut masquer des régressions.

## Comment ça fonctionne

Le flow est : besoin → candidats → benchmark contrôlé → analyse qualité/coût/latence → déploiement limité → monitoring. Un modèle local donne plus de contrôle mais demande infrastructure et maintenance ; une API réduit l'exploitation mais ajoute dépendance fournisseur et coûts variables.

## Questions d'entretien

Pourquoi un benchmark interne est-il nécessaire ?

:::indice
Relie ta réponse au fonctionnement concret du modèle.
:::

:::reponse
Parce que les performances générales ne garantissent pas le comportement sur les tâches, langues et contraintes réelles du produit.
:::
