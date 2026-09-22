---
id: ai-12-reliability
title: "Fiabilité et résilience"
slug: reliability
technology: ai-engineering
level: advanced
module: production
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

## Exercices
- Les retries illimités amplifient congestion et coût. Un fallback mal choisi peut aussi produire une qualité trompeuse ; il faut donc définir ce qui est acceptable pour chaque mode dégradé.

:::indice
- Le modèle principal est indisponible mais la recherche interne fonctionne. Quelle stratégie ?
:::
:::solution
Identifie d'abord les capacités qui restent fiables.
:::
## Erreurs fréquentes

Le flow est : failure → detect → timeout/circuit breaker → fallback ou dégradation → réponse observable → recovery. Les budgets de temps doivent traverser toute la chaîne.

## À retenir

Conserver les fonctions déterministes disponibles et retourner un état dégradé explicite ou router vers un modèle compatible, avec métriques et limites.

## Introduction

Concevoir pour les pannes plutôt que pour le chemin nominal

## Concept

Un système AI dépend souvent de plusieurs services : provider LLM, vector store, queue, base, stockage et APIs externes. Chacun peut timeout, refuser une requête ou devenir lent.

## Exemple

Un fallback doit être explicite. Selon le produit, on peut utiliser un modèle compatible, une recherche lexicale, une réponse différée, une lecture seule ou une fonctionnalité déterministe.

## Comment ça fonctionne

Si le provider principal tombe mais que la recherche interne fonctionne, retourner une information déterministe ou un état dégradé peut être préférable à multiplier les retries vers une dépendance indisponible.

## Questions d'entretien
- La résilience décrit le comportement attendu lorsque les dépendances échouent.

:::indice
Relie ta réponse à une contrainte opérationnelle concrète.
:::
:::reponse
Pourquoi limiter les retries ?
:::