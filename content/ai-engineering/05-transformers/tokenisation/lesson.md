---
id: ai-05-transformers-tokenisation
title: "Tokenization & representations"
slug: tokenisation
technology: ai-engineering
level: intermediate
module: 05-transformers
order: 1
estimatedMinutes: 40
difficulty: 3
xp: 110
prerequisites: []
skills:
  - ai-llm
tags: [ai, llm, transformers]
---

## Objectifs
- Comprendre Tokenization & representations.
- Savoir l'intégrer dans une chaîne d'inférence ou d'entraînement.
- Mesurer qualité, coût et limites.

## Concept
Les modèles modernes sont des systèmes statistiques : leurs sorties dépendent des données, de l'architecture et de la configuration d'exécution. Tokenization & representations doit donc être abordé avec des mesures reproductibles et des cas de test représentatifs.

Un pipeline LLM typique sépare tokenisation, représentation, calcul du modèle, décodage puis post-traitement. Cette séparation permet d'observer où apparaissent les erreurs et où se trouve le coût.

## Pratique
- Inspecte les entrées et sorties à chaque étape.
- Compare une baseline avant toute optimisation.
- Mesure latence, mémoire et qualité.
- Teste les limites : contexte long, entrées invalides et contenu ambigu.
- Versionne modèle et configuration.

## Erreurs fréquentes
- Croire que davantage de paramètres garantit une meilleure réponse pour tout problème.
- Oublier la limite de contexte.
- Comparer deux modèles avec des prompts différents.
- Ignorer le coût d'inférence.
- Confondre score de benchmark et qualité réelle du produit.

## Exercice
Construis une petite expérience sur **Tokenization & representations**. Définis six cas, une métrique de qualité, une mesure de latence et une observation sur le coût ou la mémoire.

:::indice
Mesure séparément qualité et ressources : une amélioration de l'une peut dégrader l'autre.
:::

:::solution
La solution doit conserver une baseline, utiliser les mêmes cas pour comparer les variantes et rapporter au moins qualité, latence et ressources.
:::

## À retenir
- L'architecture et la représentation influencent directement le comportement du modèle.
- Les benchmarks ne remplacent pas l'évaluation de ton cas d'usage.
- Qualité et coût doivent être mesurés ensemble.
