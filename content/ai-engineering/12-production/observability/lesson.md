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
skills: [ai-observability]
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
## Lab pratique : trace exploitable sans fuite de données

Définis un événement de trace minimal pour une requête AI :

```json
{
  "requestId": "req_123",
  "tenantId": "tenant_42",
  "feature": "document-answer",
  "model": "model-version",
  "promptVersion": "answer-v7",
  "inputTokens": 1200,
  "outputTokens": 180,
  "latencyMs": 840,
  "status": "ok"
}
```

Ne stocke pas automatiquement le prompt, la réponse ou les documents complets. Si leur conservation est réellement nécessaire pour une évaluation, définis une politique de redaction, d'accès et de rétention distincte.

Critères de réussite :
- une requête peut être corrélée à ses appels internes ;
- coût et latence sont calculables par fonctionnalité et tenant ;
- la version du modèle et du prompt est identifiable ;
- les données sensibles ne sont pas présentes par défaut dans les logs.

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