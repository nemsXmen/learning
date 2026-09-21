---
id: ai-12-reliability
title: "Fiabilité et résilience"
slug: reliability
technology: ai-engineering
level: advanced
module: 12-production
order: 4
estimatedMinutes: 80
difficulty: 5
xp: 180
prerequisites: [ai-12-operations]
skills: [ai-production]
tags: [production, reliability, observability]
---

## Objectifs
- concevoir des fallbacks ;
- gérer dépendances externes ;
- pratiquer la dégradation contrôlée ;
- tester les scénarios de panne.

## Failure modes
Provider indisponible, timeout, réponse invalide, rate limit, vector store indisponible ou queue saturée.

```text
dependency failure -> timeout -> fallback/degrade -> observable response
```

Ne masque pas une panne par des retries illimités. Les budgets de temps doivent traverser toute la chaîne.

## Dégradation
Une fonctionnalité peut passer en recherche lexicale, modèle plus petit, réponse différée ou lecture seule selon le produit.

## Exercice
Le modèle principal est indisponible mais la recherche interne fonctionne. Quelle stratégie ?

### Solution
Conserver les fonctions déterministes disponibles et retourner un état dégradé explicite ou router vers un modèle compatible.

## À retenir
La résilience consiste à prévoir comment le système se comporte quand ses dépendances échouent.
