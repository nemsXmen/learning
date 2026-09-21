---
id: ai-12-observability
title: "Observabilité LLM et AI systems"
slug: observability
technology: ai-engineering
level: advanced
module: 12-production
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

## Exercice
Le coût par requête double sans hausse de trafic. Où chercher ?

### Solution
Comparer tokens, modèle routé, retries, contexte, outils et changement de prompt.

## À retenir
Sans corrélation entre version, requête et métriques, une régression IA est difficile à expliquer.
