---
id: ai-10-security-agent-security
title: "Least privilege & tool safety"
slug: agent-security
technology: ai-engineering
level: intermediate
module: 10-security
order: 1
estimatedMinutes: 45
difficulty: 3
xp: 120
prerequisites: []
skills:
  - ai-security
tags: [ai, infrastructure]
---

## Objectifs
- Comprendre Least privilege & tool safety.
- Choisir une architecture adaptée à la charge.
- Mesurer fiabilité, latence et coût.

## Concept
L'infrastructure AI doit isoler les ressources coûteuses et les dépendances externes du reste de l'application. **Least privilege & tool safety** se conçoit avec des limites explicites : concurrence, taille des requêtes, mémoire, durée d'exécution, quotas et capacité.

Une architecture robuste accepte les pics et les erreurs. Les files permettent de découpler les traitements longs, les caches réduisent les appels répétitifs et les limites empêchent une demande d'épuiser les ressources.

## Méthode
1. Mesurer le trafic attendu.
2. Définir un budget de latence et de coût.
3. Déterminer les limites de concurrence.
4. Ajouter timeouts, retries bornés et rate limits.
5. Observer saturation CPU/GPU, mémoire et files.
6. Tester sous charge avant production.

## Erreurs fréquentes
- Dimensionner sur une moyenne au lieu d'un pic.
- Mettre un cache sans stratégie d'invalidation.
- Utiliser des retries qui amplifient la charge.
- Ignorer la taille des vecteurs ou de l'index.
- Confondre capacité théorique et débit réellement mesuré.

## Exercice
Dessine une architecture pour **Least privilege & tool safety**. Donne au moins une limite de capacité, une métrique de saturation, une stratégie de reprise et une estimation du coût.

:::indice
Chaque ressource partagée doit avoir un propriétaire, une limite et une métrique.
:::

:::solution
Une architecture acceptable explicite les ressources, limites, files éventuelles, métriques de saturation et comportements en cas de panne ou de surcharge.
:::

## À retenir
- L'infrastructure est une partie du produit AI.
- Les limites protègent coût et disponibilité.
- Il faut mesurer avant de dimensionner.
