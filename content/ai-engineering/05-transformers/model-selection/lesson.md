---
id: ai-05-transformers-model-selection
title: "Open and hosted models"
slug: model-selection
technology: ai-engineering
level: intermediate
module: 05-transformers
order: 4
estimatedMinutes: 40
difficulty: 3
xp: 120
prerequisites: []
skills: [ai-llm]
tags: [ai, llm, models]
---

## Objectifs
- Comparer un modèle hébergé et un modèle auto-hébergé.
- Construire une procédure de sélection basée sur le besoin.
- Mesurer qualité, coût, latence et contraintes opérationnelles.

## Concept
Le choix d'un modèle ne dépend pas uniquement de sa qualité brute. Il faut considérer la qualité sur les cas réels, la latence, le coût par requête, les limites de contexte, la confidentialité des données, la disponibilité et l'effort d'exploitation.

Une évaluation sérieuse utilise le même dataset et le même protocole pour les candidats. Le résultat doit être documenté afin de pouvoir refaire la comparaison après une évolution du produit.

## Exercice
Crée une matrice de comparaison pour trois modèles fictifs ou réels. Définis au moins cinq critères et explique leur importance pour ton cas d'usage.

## À retenir
- Il n'existe pas de modèle universellement adapté à tous les usages.
- La sélection est une décision système, pas uniquement un benchmark.
- Une comparaison reproductible protège contre les choix basés sur une simple impression.
