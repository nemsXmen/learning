---
id: ai-05-transformers-llm-architecture
title: "LLM architecture & inference"
slug: llm-architecture
technology: ai-engineering
level: intermediate
module: 05-transformers
order: 3
estimatedMinutes: 45
difficulty: 3
xp: 120
prerequisites: []
skills: [ai-llm]
tags: [ai, transformers, llm]
---

## Objectifs
- Comprendre le chemin d'une requête à travers un LLM.
- Distinguer paramètres, contexte, cache et décodage.
- Identifier les coûts de l'inférence.

## Concept
À l'inférence, le modèle transforme une séquence tokenisée en distributions de probabilité puis en nouveaux tokens. Le contexte fourni à chaque requête consomme de la mémoire et du calcul. La taille du modèle, la longueur du contexte, le débit et le matériel influencent donc directement latence et coût.

Un service applicatif doit séparer préparation du contexte, appel modèle et post-traitement. Cette frontière facilite les tests et permet d'ajouter cache, streaming ou fallback sans mélanger la logique métier au moteur d'inférence.

## Exercice
Trace le parcours d'une requête depuis le texte utilisateur jusqu'à la réponse. Identifie trois endroits où mesurer latence ou consommation mémoire.

## À retenir
- L'inférence est un pipeline mesurable.
- Contexte, modèle et stratégie de décodage influencent le coût.
- Les frontières logicielles facilitent l'évolution du système.
