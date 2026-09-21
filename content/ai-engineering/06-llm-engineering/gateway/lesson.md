---
id: ai-06-llm-engineering-gateway
title: "LLM gateways, retries & cost control"
slug: gateway
technology: ai-engineering
level: intermediate
module: 06-llm-engineering
order: 1
estimatedMinutes: 40
difficulty: 3
xp: 110
prerequisites: []
skills:
  - ai-production
tags: [ai, llm, production]
---

## Objectifs
- Comprendre LLM gateways, retries & cost control.
- Construire un composant LLM testable.
- Maîtriser validation, erreurs et limites opérationnelles.

## Concept
Une application LLM doit traiter le modèle comme une dépendance non déterministe. Le logiciel autour du modèle impose donc des contrats : entrées validées, sorties structurées, timeouts, limites de taille, gestion des erreurs et journalisation sans données sensibles.

Pour **LLM gateways, retries & cost control**, sépare l'orchestration de l'interface fournisseur. Un gateway permet de centraliser authentification, quotas, retries, fallback, budget et métriques.

## Pratique
1. Définis un schéma d'entrée.
2. Définis un schéma de sortie.
3. Valide la réponse avant de la transmettre au reste du système.
4. Ajoute timeout et limite de retry.
5. Mesure tokens, latence, erreurs et coût.

## Erreurs fréquentes
- Faire confiance à une sortie texte quand un contrat structuré est nécessaire.
- Réessayer sans limite une requête coûteuse.
- Exposer les secrets au client.
- Logger des prompts contenant des données sensibles.
- Coupler toute l'application à une API fournisseur.

## Exercice
Conçois un service gateway avec une interface fournisseur indépendante. Décris ses entrées, sorties, erreurs, timeout, politique de retry et métriques.

:::indice
Le modèle peut échouer ou répondre dans un format inattendu : le système doit rester contrôlable.
:::

:::solution
Un service robuste valide les entrées, impose un format de sortie, limite les retries, protège les secrets et expose des métriques permettant d'observer qualité, latence et coût.
:::

## À retenir
- Le modèle est une dépendance ; l'application doit en contrôler les frontières.
- Les sorties doivent être validées avant usage métier.
- Les limites opérationnelles sont des fonctionnalités, pas des détails.
