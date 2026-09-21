---
id: ai-12-operations
title: "Opérations, incidents et coûts"
slug: operations
technology: ai-engineering
level: advanced
module: 12-production
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

## Exercice
Un agent boucle et génère une facture inattendue. Que faire ?

### Solution
Limiter trafic ou quotas, arrêter la boucle, identifier la version fautive, corriger puis analyser la cause racine.

## À retenir
Les systèmes IA ont besoin des mêmes disciplines opérationnelles que les systèmes critiques.
