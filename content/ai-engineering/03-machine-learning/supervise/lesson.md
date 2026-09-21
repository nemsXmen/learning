---
id: ai-03-machine-learning-supervise
title: "Supervised learning"
slug: supervise
technology: ai-engineering
level: intermediate
module: 03-machine-learning
order: 1
estimatedMinutes: 35
difficulty: 2
xp: 100
prerequisites: []
skills:
  - ai-ml-basics
tags:
  - ai
  - ai-engineering
---

## Objectifs

- Comprendre le problème avant de choisir un modèle ou un framework.
- Savoir appliquer le concept dans un système reproductible.
- Identifier les compromis de qualité, coût, latence, sécurité et maintenabilité.

## Introduction

L'ingénierie AI ne consiste pas à appeler un modèle et à afficher sa réponse. Elle consiste à construire un système dont les entrées, transformations, dépendances, sorties et contrôles sont explicites.

## Concept

**Supervised learning** s'étudie avec une boucle d'ingénierie : définir le contrat d'entrée/sortie, établir une baseline, mesurer sur des cas représentatifs, isoler les variables, tester les erreurs et les cas adverses, puis déployer avec des limites et de l'observabilité.

Une bonne solution reste compréhensible lorsque les données, utilisateurs, modèles ou dépendances changent.

## Exemple

Un composant applicatif devrait dépendre d'une interface stable plutôt que d'un fournisseur concret. Par exemple, une fonction de classification peut recevoir un texte, valider qu'il n'est pas vide, appeler un modèle injecté, puis retourner un résultat normalisé avec label et confiance. Cette séparation rend le composant testable et permet de remplacer le modèle.

## Méthode professionnelle

Pour chaque expérimentation, conserve la version du code, l'identifiant du dataset, le modèle et sa version, la configuration, les métriques, la latence, le coût approximatif et les erreurs observées. Pour une application LLM, versionne aussi prompts, schémas de sortie, outils autorisés et règles de sécurité.

## Erreurs fréquentes

- Choisir un modèle avant de définir la métrique.
- Confondre une réponse plausible avec une réponse correcte.
- Tester uniquement des exemples faciles.
- Mélanger données de développement et données d'évaluation.
- Donner à un agent des permissions supérieures à son besoin.
- Oublier les timeouts, limites de coût et comportements de secours.

## Exercice

Construis une petite expérience sur **Supervised learning**.

1. Définis une entrée et une sortie.
2. Écris trois cas normaux et trois cas difficiles.
3. Choisis une métrique observable.
4. Ajoute au moins une validation de sécurité.
5. Note ce qui pourrait changer entre deux exécutions.

:::indice
Si tu ne peux pas expliquer comment détecter une régression, ton expérimentation n'est pas encore suffisamment définie.
:::

:::solution
Une solution acceptable possède un contrat clair, un dataset de référence, une métrique calculable et une procédure de comparaison entre deux versions. Elle sépare également développement et évaluation.
:::

## À retenir

- L'AI engineering est d'abord de l'ingénierie de systèmes.
- Les contrats, tests, métriques et versions rendent les expériences reproductibles.
- Qualité, coût, latence et sécurité doivent être considérés ensemble.
