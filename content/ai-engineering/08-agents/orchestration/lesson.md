---
id: ai-08-orchestration
title: "Orchestration multi-agents"
slug: orchestration
technology: ai-engineering
level: advanced
module: 08-agents
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

## Exercice
Deux agents modifient la même ressource simultanément. Comment prévenir les conflits ?

### Solution
Centraliser l'autorisation et l'écriture, utiliser verrou/version optimiste ou idempotency key et définir une source d'autorité unique.

## À retenir
Le multi-agent est une architecture, pas un objectif. Mesure son bénéfice contre sa complexité.


## Introduction

Plusieurs agents peuvent être orchestrés mais chaque agent supplémentaire augmente la complexité.

## Concept

Les contrats d'entrée/sortie et la responsabilité de chaque rôle doivent être explicites.

## Exemple

Un planner peut déléguer une recherche à un worker spécialisé puis agréger les résultats.

## Comment ça fonctionne

planner → specialist → result → synthesis

## Questions d'entretien

- Quand éviter le multi-agent ?

  :::indice
  Cherche la frontière entre décision du modèle et contrôle déterministe.
  :::

  :::reponse
  Lorsque le workflow déterministe ou un seul agent répond au besoin avec moins de complexité.
  :::
