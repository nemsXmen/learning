---
id: ai-15-architecture
title: "Capstone : architecture d'un AI SaaS production"
slug: architecture
technology: ai-engineering
level: expert
module: 15-capstone
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

### Solution
Les outils ayant des effets de bord, accès aux données sensibles ou coût important doivent être protégés par le backend et non par une simple instruction du prompt.

## À retenir
Le capstone doit être conçu comme un produit logiciel distribué, pas comme un simple prompt.
