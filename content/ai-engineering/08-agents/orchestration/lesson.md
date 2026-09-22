---
id: ai-08-orchestration
title: "Orchestration multi-agents"
slug: orchestration
technology: ai-engineering
level: advanced
module: agents
order: 3
estimatedMinutes: 80
difficulty: 5
xp: 170
prerequisites: [ai-08-memory]
skills: [ai-agents]
tags: [agents, tools, orchestration, safety]
---

## Objectifs
- choisir entre agent unique et plusieurs agents ;
- découper les responsabilités ;
- contrôler communication et budgets ;
- éviter la complexité inutile.

## Architectures
Un orchestrateur peut déléguer à des spécialistes : retrieval, analyse, génération ou vérification.

```text
orchestrator
  -> specialist A
  -> specialist B
  -> verifier
  -> finalizer
```

Chaque agent doit avoir un contrat clair : entrée, sortie, outils et budget.

## Quand éviter le multi-agent
Si une fonction déterministe ou un seul appel suffit, ajouter des agents augmente latence, coûts et surface d'erreur.

## Exercices
- Deux agents qui modifient simultanément la même ressource peuvent créer une course. Utilise version optimiste, verrou, idempotence ou un service d'écriture central selon le cas.

:::indice
- Deux agents modifient la même ressource simultanément. Comment prévenir les conflits ?
::

:::solution
Cherche une source d'autorité unique pour l'écriture.
::
## Erreurs fréquentes

Le flow peut être : orchestrator → specialist → résultat structuré → verifier → synthèse. Les échanges doivent être bornés et les résultats validés. Lorsqu'une ressource partagée est modifiée, l'écriture doit passer par une autorité clairement définie.

## À retenir

Centraliser l'autorisation et l'écriture, utiliser une version optimiste ou un verrou et ajouter une clé d'idempotence lorsque nécessaire.

## Introduction

Quand plusieurs agents apportent réellement quelque chose

## Concept

Le multi-agent permet de séparer des responsabilités, mais chaque agent supplémentaire ajoute une frontière de communication, une latence et une possibilité d'échec.

## Exemple

Un orchestrateur peut déléguer à des spécialistes : retrieval, analyse, génération ou vérification. Chaque spécialiste doit avoir un contrat d'entrée, de sortie, d'outils et de budget.

## Comment ça fonctionne

Par exemple, un planner peut demander à un agent de recherche de collecter les sources, puis à un vérificateur de contrôler les affirmations avant la synthèse finale. Si le même résultat peut être obtenu par une fonction déterministe, cette orchestration serait inutile.

## Questions d'entretien
- Le multi-agent est une architecture à justifier par un bénéfice mesurable, pas un objectif en soi.

:::indice
Pense à la séparation entre modèle, runtime et système d'autorisation.
::

:::reponse
Quand éviter le multi-agent ?
::