---
id: ai-15-architecture
title: "Capstone : architecture d'un AI SaaS production"
slug: capstone-architecture
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
- concevoir l'architecture d'un AI SaaS complet ;
- définir les responsabilités de chaque couche ;
- intégrer auth, RAG, agents, données et modèles ;
- préparer sécurité, observabilité, quotas et billing ;
- identifier les trust boundaries avant d'écrire du code.

## Introduction

Le capstone assemble les briques de la formation dans un produit SaaS réel : un utilisateur authentifié soumet une tâche, le système récupère éventuellement du contexte, appelle un modèle, peut utiliser des outils, valide le résultat, persiste les données et expose des métriques.

La difficulté vient moins du LLM que des frontières entre composants. Une architecture senior doit empêcher qu'une sortie probabiliste devienne directement une action sensible.

## Concept

Une architecture cible peut être organisée ainsi :

~~~text
Next.js
   |
API / Auth / Quotas
   |
AI Gateway -------- Evaluation
 |      |              |
LLM    RAG           Traces
 |      |
Agents  Vector Store
   |
Postgres / Redis / Object Storage
   |
Workers
~~~

Le frontend ne parle pas directement aux fournisseurs de modèles. L'API contrôle identité, tenant, permissions, quotas et contrats. Le gateway centralise les appels IA. Les workers traitent les tâches longues. Postgres conserve l'état métier ; Redis sert aux usages nécessitant faible latence ; le vector store sert au retrieval.

## Exemple

Pour une question sur des documents privés :

~~~text
request
  ↓
authentication
  ↓
tenant + authorization
  ↓
retrieval avec ACL
  ↓
LLM
  ↓
structured validation
  ↓
tool policy si nécessaire
  ↓
persistence
  ↓
trace + usage + billing
~~~

Le modèle peut proposer un tool call, mais il ne décide pas seul si cette action est autorisée.

## Comment ça fonctionne

Définis d'abord les contrats internes : entrée métier, contexte récupéré, réponse du gateway, demande d'outil, usage et événement d'audit.

Sépare les responsabilités déterministes des responsabilités probabilistes. L'IA peut résumer, classifier ou proposer. L'application décide des permissions, de la validation métier et de l'écriture finale.

Les trust boundaries doivent être explicites : navigateur → API, API → fournisseur LLM, retrieval → modèle, modèle → tools, worker → stockage.

## Erreurs fréquentes

- laisser le frontend appeler directement le fournisseur LLM ;
- faire confiance au modèle pour l'autorisation ;
- mélanger état métier et historique de conversation ;
- oublier l'isolation multi-tenant ;
- ne pas versionner prompts et modèles ;
- ajouter des agents alors qu'un workflow déterministe suffit ;
- intégrer le billing sans enregistrer l'usage réel.

## Exercices
- Dessine les trust boundaries et indique quelles opérations nécessitent une autorisation indépendante du modèle.

:::indice
Repère les données privées, les effets de bord et les opérations coûteuses. Pour chacun, demande : « qui décide si cette action est permise ? ».
::

:::solution
Les accès aux données privées, écritures métier, paiements, envois et appels à privilèges doivent être contrôlés côté serveur par une politique déterministe. Le modèle peut proposer une action, mais l'API ou un policy engine vérifie identité, tenant, permissions, paramètres et limites avant exécution.
::
## À retenir

Un AI SaaS production est un système distribué avec une couche IA, pas un simple wrapper autour d'un LLM.

## Questions d'entretien
- Où placer les autorisations ?
  - Pourquoi centraliser les appels LLM dans un gateway ?
  - Quelles responsabilités doivent rester déterministes ?
  - Comment isoler plusieurs tenants ?

:::indice
Réponds en termes de responsabilités, de trust boundaries et de contrôles vérifiables.
::

:::reponse
Les autorisations doivent être appliquées côté serveur avant les effets de bord. Un gateway centralise contrats, timeouts, retries, observabilité et coûts. Les permissions et invariants métier restent déterministes. L'isolation multi-tenant doit être appliquée dans les requêtes, le retrieval, le cache et les outils, pas uniquement dans le prompt.
::