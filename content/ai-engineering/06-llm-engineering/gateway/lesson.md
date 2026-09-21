---
id: ai-06-gateway
title: "LLM Gateway, routage et résilience"
slug: gateway
technology: ai-engineering
level: intermediate
module: 06-llm-engineering
order: 4
estimatedMinutes: 75
difficulty: 5
xp: 160
prerequisites: [ai-06-tools]
skills: [ai-llm-engineering]
tags: [llm, ai-engineering]
---


## Objectifs
- centraliser les appels LLM ;
- gérer timeout, retry et rate limit ;
- contrôler coûts et observabilité ;
- faciliter le changement de fournisseur.

## Architecture
```text
application
   -> LLM Gateway
      -> provider A
      -> provider B
      -> local model
```

Le gateway impose un contrat interne stable et évite de disperser les clés et politiques d'appel.

## Résilience
Définis timeout, retry limité, backoff, circuit breaker et fallback. Ne retry pas toutes les erreurs : une erreur d'autorisation ne devient pas correcte au deuxième appel.

## Rate limiting
Limite par utilisateur, organisation, clé ou route et protège les budgets.

## Coûts et observabilité
Journalise modèle, tokens entrée/sortie, durée, statut et request ID. Agrège par tenant et fonctionnalité.

## Streaming
Le streaming améliore souvent le temps avant le premier token perçu mais complexifie annulation, reconnexion et comptage.

## Secrets
Les clés fournisseurs restent côté serveur.

## Exercice
Un fournisseur devient indisponible. Décris un fallback propre.

### Solution
Détecter les erreurs éligibles, respecter un timeout global, sélectionner un fournisseur compatible, tracer le changement et éviter les retries en cascade.

## À retenir
Un gateway rend les appels LLM contrôlables, observables et remplaçables.
