---
id: ai-12-operations
title: "Opérations, incidents et coûts"
slug: operations
technology: ai-engineering
level: advanced
module: production
order: 3
estimatedMinutes: 75
difficulty: 5
xp: 170
prerequisites: [ai-12-observability]
skills: [ai-production]
tags: [production, reliability, observability]
---

## Objectifs
- construire une procédure incident ;
- gérer budgets et quotas ;
- documenter runbooks ;
- distinguer panne fournisseur et panne applicative.

## Incident flow
```text
detect -> triage -> contain -> mitigate -> recover -> review
```

Les runbooks indiquent commandes, dashboards, seuils et rollback.

## Coûts
Suivre coût par modèle, tenant, fonctionnalité et période. Budgets et quotas évitent les consommations illimitées.

## Exercices
Un agent boucle et génère une facture inattendue. Que faire ?

:::indice
Raisonne en détection → mitigation → récupération → vérification.
:::

:::solution
Limiter trafic ou quotas, arrêter la boucle, identifier la version fautive, corriger puis analyser la cause racine.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
Les systèmes IA ont besoin des mêmes disciplines opérationnelles que les systèmes critiques.


## Introduction

L'exploitation quotidienne nécessite quotas, budgets, runbooks et procédures d'incident.

## Concept

Les opérations AI doivent prévoir dépassement de coût, fournisseur indisponible et dégradation contrôlée.

## Exemple

Un quota journalier peut empêcher une boucle agentique coûteuse de consommer toute la capacité.

## Comment ça fonctionne

detect → mitigate → communicate → recover → postmortem

## Questions d'entretien

- Pourquoi un runbook doit-il être écrit avant incident ?

  :::indice
  Pense aux conséquences d'une panne sous trafic réel.
  :::

  :::reponse
  Pour réduire le temps de décision lorsque la pression opérationnelle est forte.
  :::
