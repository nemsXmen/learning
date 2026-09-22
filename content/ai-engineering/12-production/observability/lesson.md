---
id: ai-12-observability
title: "Observabilité LLM et AI systems"
slug: observability
technology: ai-engineering
level: advanced
module: production
order: 2
estimatedMinutes: 80
difficulty: 5
xp: 180
prerequisites: [ai-12-deployment]
skills: [ai-production]
tags: [production, reliability, observability]
---

## Objectifs
- tracer les requêtes ;
- mesurer qualité, latence et coût ;
- corréler modèle, prompt et version ;
- protéger les données observées.

## Traces
Utilise requestId, tenant, route, modèle, version de prompt, durée, tokens et statut.

```text
request -> trace -> model call -> tool calls -> response
             |          |             |
          latency      cost         errors
```

## SLO
Définis objectifs sur disponibilité, latence et erreurs. Ajoute des signaux qualité lorsque leur calcul respecte les contraintes de confidentialité.

## Exercices
Le coût par requête double sans hausse de trafic. Où chercher ?

:::indice
Raisonne en détection → mitigation → récupération → vérification.
:::

:::solution
Comparer tokens, modèle routé, retries, contexte, outils et changement de prompt.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
Sans corrélation entre version, requête et métriques, une régression IA est difficile à expliquer.


## Introduction

L'observabilité relie une requête utilisateur à ses appels modèles et outils.

## Concept

Traces, métriques, logs, coûts et p95/p99 permettent de diagnostiquer les incidents.

## Exemple

Une trace peut montrer qu'une réponse lente vient de retrieval plutôt que du modèle.

## Comment ça fonctionne

request trace → retrieval → model → tools → response metrics

## Questions d'entretien

- Que doit contenir une trace AI utile ?

  :::indice
  Pense aux conséquences d'une panne sous trafic réel.
  :::

  :::reponse
  Identifiants corrélés, latence, erreurs, étapes et métadonnées minimisées sans exposer inutilement des données sensibles.
  :::
