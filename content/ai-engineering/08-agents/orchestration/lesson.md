---
id: ai-08-agents-orchestration
title: "Multi-step workflows & human approval"
slug: orchestration
technology: ai-engineering
level: intermediate
module: 08-agents
order: 1
estimatedMinutes: 45
difficulty: 3
xp: 120
prerequisites: []
skills:
  - ai-agents
tags: [ai, evaluation, agents]
---

## Objectifs
- Comprendre Multi-step workflows & human approval.
- Concevoir un comportement contrôlable.
- Mesurer qualité et risques.

## Concept
Un système agentique combine un modèle, un état et des outils. **Multi-step workflows & human approval** doit donc être traité comme un problème d'orchestration logicielle. Le modèle ne doit jamais obtenir implicitement une permission que le produit n'a pas explicitement accordée.

Une évaluation AI doit partir de cas représentatifs, avec des attentes explicites. Les juges automatiques peuvent accélérer la mesure, mais ils doivent eux-mêmes être contrôlés et complétés par des vérifications déterministes ou humaines lorsque l'enjeu le justifie.

## Méthode
- Définir les états possibles.
- Définir les transitions autorisées.
- Limiter le nombre d'étapes.
- Donner à chaque outil le minimum de permissions.
- Journaliser les décisions utiles sans exposer de secrets.
- Construire un dataset d'évaluation versionné.

## Erreurs fréquentes
- Laisser le modèle inventer des permissions.
- Confondre mémoire utile et accumulation de contexte.
- Utiliser uniquement un score global.
- Évaluer sur les mêmes exemples que ceux ayant servi à ajuster le système.
- Faire confiance à un juge automatique sans calibration.

## Exercice
Construis un agent ou une suite d'évaluation minimale. Définis dix cas, leurs attentes, les limites d'exécution et la procédure de comparaison entre deux versions.

:::indice
Une métrique doit aider à prendre une décision technique. Si elle ne change jamais une décision, elle est probablement mal choisie.
:::

:::solution
La solution doit séparer état, outils et règles, puis utiliser un dataset versionné avec des critères observables. Les contrôles critiques doivent être déterministes lorsque possible.
:::

## À retenir
- Les agents sont des systèmes à états et permissions.
- L'évaluation est un produit logiciel versionné.
- Les juges automatiques sont des outils, pas une vérité absolue.
