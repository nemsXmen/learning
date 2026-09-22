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

Un quota n'est pas une stratégie de correction : il limite l'impact. Après containment, il faut identifier la version et la cause, corriger, vérifier puis documenter.

:::indice
- Un agent boucle et génère une facture inattendue. Que faire ?
:::

:::solution
Commence par arrêter l'hémorragie.
:::

## Erreurs fréquentes

Le flow est : detect → triage → contain → mitigate → recover → review. Pendant l'incident, distingue panne fournisseur, panne applicative et problème de données pour éviter de corriger le mauvais composant.

## À retenir

Limiter trafic ou quotas, arrêter la boucle, identifier la version fautive, corriger puis analyser la cause racine avant réactivation progressive.

## Introduction

Opérer avec des runbooks et des garde-fous

## Concept

L'exploitation AI inclut incidents techniques, indisponibilité de fournisseurs, dérive de coût et comportements agentiques inattendus. Une procédure claire réduit le temps entre détection et mitigation.

## Exemple

Un runbook décrit signaux, seuils, dashboards, actions sûres, escalade et rollback. Les quotas et budgets ajoutent une limite indépendante du modèle.

## Comment ça fonctionne

Un agent boucle et multiplie les appels LLM. Sans budget de steps, quota ou limite de dépense, une erreur de contrôle peut devenir un incident financier.

## Questions d'entretien

Les opérations AI combinent fiabilité classique, contrôle des coûts et maîtrise des comportements non déterministes.

:::indice
Relie ta réponse à une contrainte opérationnelle concrète.
:::

:::reponse
Pourquoi un runbook doit-il être écrit avant incident ?
:::
