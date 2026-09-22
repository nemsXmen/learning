---
id: ai-06-gateway
title: "LLM Gateway, routage et résilience"
slug: gateway
technology: ai-engineering
level: intermediate
module: llm-engineering
order: 4
estimatedMinutes: 75
difficulty: 5
xp: 160
prerequisites: [ai-06-tools]
skills: [ai-llm-apps]
tags: [llm, ai-engineering]
---


## Objectifs

LLM gateway

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

## Exercices
- Un fournisseur devient indisponible. Décris un fallback propre.

:::indice
Commence par distinguer les erreurs réellement récupérables des erreurs définitives.
:::
:::solution
Détecter une erreur éligible, respecter un timeout global, choisir un fournisseur compatible, tracer le fallback et empêcher les retries en cascade.
:::
## Erreurs fréquentes

Un retry ne corrige pas toutes les erreurs. Une erreur d'autorisation, un input invalide ou une violation de quota ne doit pas être relancée aveuglément. Le streaming ajoute aussi des cas particuliers : annulation, reconnexion et comptage des tokens.

## À retenir

Un gateway transforme des appels LLM dispersés en un contrat contrôlable, observable et remplaçable.

## Introduction

Un gateway devient utile dès que plusieurs fonctionnalités doivent appeler des modèles sans répéter partout les mêmes règles de sécurité, timeout, coût et observabilité.

## Concept

Le gateway impose un contrat interne stable entre l'application et les fournisseurs. L'application demande une génération selon ce contrat ; le gateway choisit le fournisseur, applique les politiques et normalise la réponse.

## Exemple

Imagine une application qui commence avec un seul fournisseur puis doit ajouter un modèle moins coûteux pour les tâches simples. Sans abstraction, chaque feature contient son propre code fournisseur. Avec un gateway, le changement reste concentré dans une couche.

## Comment ça fonctionne

Le flow est : application → gateway → sélection du provider → appel → validation → réponse normalisée. Le gateway peut appliquer un timeout global, des retries limités, un circuit breaker, un fallback compatible et un rate limit. Il enregistre aussi request ID, modèle, tokens, durée, statut et coût estimé.

## Questions d'entretien
- Pourquoi centraliser les clés et politiques LLM dans un gateway ?

:::indice
Relie ta réponse à la frontière entre modèle et application.
:::
:::reponse
Pour garder les secrets côté serveur et appliquer les règles de coût, sécurité, rate limit et résilience de façon cohérente.
:::