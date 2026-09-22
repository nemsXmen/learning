---
id: ai-15-architecture
title: "Capstone : architecture d'un AI SaaS production"
slug: architecture
technology: ai-engineering
level: expert
module: capstone
order: 1
estimatedMinutes: 100
difficulty: 5
xp: 240
prerequisites: [ai-14-advanced-inference]
skills: [ai-capstone]
tags: [capstone, architecture, rag, agents, production]
---

## Objectifs
- concevoir un AI SaaS complet ;
- définir les frontières de responsabilité ;
- intégrer données, modèles et outils ;
- préparer sécurité, observabilité et billing.

## Architecture cible
```text
Next.js
   |
API / Auth / Quotas
   |
AI Gateway ---- Evaluation
 |  |  LLM RAG  Agents
 |   |     |
Postgres Redis Vector Store
   |
Workers / Object Storage
```

Le frontend ne doit pas appeler directement les fournisseurs de modèles. Le backend contrôle identité, permissions, quotas, validation et effets de bord.

## Flux principal
1. authentification ;
2. création d'une tâche ;
3. récupération de contexte ;
4. appel du modèle ;
5. validation structurée ;
6. tool call éventuel ;
7. persistance ;
8. trace d'observabilité ;
9. facturation.

## Exercice
Dessine les trust boundaries et indique quelles opérations nécessitent une autorisation indépendante du modèle.

:::indice
Décompose le système en responsabilités et vérifie chaque frontière avant le lancement.
:::

:::solution
Les outils ayant des effets de bord, accès aux données sensibles ou coût important doivent être protégés par le backend et non par une simple instruction du prompt.

:::

## Erreurs fréquentes

- choisir une technologie avant de définir le problème ;
- mesurer une moyenne sans regarder les cas critiques ;
- confondre une sortie plausible avec une sortie validée ;
- oublier coût, sécurité et opérations dans la conception.

## À retenir
Le capstone doit être conçu comme un produit logiciel distribué, pas comme un simple prompt.


## Introduction

Le capstone assemble les briques de la formation dans un AI SaaS complet.

## Concept

Frontend, API, gateway, RAG, agents, Postgres, Redis, vector store, observability et billing ont des responsabilités distinctes.

## Exemple

Le backend contrôle auth, quotas, validation et effets de bord tandis que le modèle fournit des sorties probabilistes.

## Comment ça fonctionne

request → auth → AI gateway → retrieval/agent → validation → persistence → trace

## Questions d'entretien

- Où placer les autorisations ?

  :::indice
  Pense à la responsabilité de chaque couche et au contrôle des risques.
  :::

  :::reponse
  Dans les services déterministes côté serveur, avant les opérations sensibles.
  :::
