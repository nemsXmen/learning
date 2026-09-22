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
- Éviter le log complet des prompts et réponses par défaut. Préfère métadonnées minimisées, redaction, accès restreint et rétention définie.

:::indice
- Le coût par requête double sans hausse de trafic. Où chercher ?
:::
:::solution
Compare la composition du coût avant et après le changement.
:::
## Erreurs fréquentes

Le flow est : request → trace → retrieval/tools → model call → response → metrics. Ajoute des SLO de disponibilité et de latence, puis des signaux qualité lorsque leur calcul respecte les contraintes de confidentialité.

## À retenir

Vérifier tokens, modèle routé, retries, taille du contexte, appels d'outils et version du prompt.

## Introduction

Observer le système sans exposer les données

## Concept

Une AI en production doit être diagnosable : il faut relier une requête à ses étapes, mesurer latence, erreurs, tokens et coût et savoir quelle version du modèle ou du prompt a été utilisée.

## Exemple

Une trace utile possède un requestId corrélé, le statut, les durées, le modèle, la version du prompt, les appels tools et des métriques de tokens. Elle ne doit pas devenir une copie inutile des données métier.

## Comment ça fonctionne

Une requête lente peut avoir un temps modèle normal mais attendre longtemps dans retrieval ou une queue. Une trace distribuée permet de localiser cette attente.

## Questions d'entretien
- Sans corrélation entre version, requête et métriques, une régression AI est difficile à expliquer.

:::indice
Relie ta réponse à une contrainte opérationnelle concrète.
:::
:::reponse
Que doit contenir une trace AI utile ?
:::