---
id: ai-12-production-deployment
title: "Deployment & migrations"
slug: deployment
technology: ai-engineering
level: advanced
module: 12-production
order: 1
estimatedMinutes: 45
difficulty: 4
xp: 130
prerequisites: []
skills:
  - ai-production
tags: [ai, production, product]
---

## Objectifs
- Comprendre Deployment & migrations.
- L'intégrer dans une architecture de production.
- Définir des mesures et des critères d'acceptation.

## Concept
Passer d'un prototype AI à un produit exige des garanties opérationnelles. **Deployment & migrations** relie le comportement du modèle aux préoccupations classiques du logiciel : disponibilité, latence, erreurs, coûts, sécurité et expérience utilisateur.

Un service de production doit avoir des limites explicites et des comportements de dégradation. Lorsqu'une dépendance devient indisponible, le système doit soit utiliser un fallback maîtrisé, soit échouer rapidement avec une réponse compréhensible.

## Méthode
- Définir les SLI pertinents : latence, disponibilité, erreurs, qualité.
- Fixer des seuils et une procédure d'alerte.
- Instrumenter les appels sans journaliser inutilement les données sensibles.
- Tester timeouts, retries bornés et idempotence.
- Documenter les incidents et les décisions.

## Erreurs fréquentes
- Mesurer uniquement la disponibilité HTTP.
- Ignorer les erreurs de qualité.
- Ajouter un retry sans budget.
- Ne pas distinguer incident technique et dérive du comportement AI.
- Déployer sans procédure de rollback.

## Exercice
Définis un mini runbook pour **Deployment & migrations** : métriques, seuils, alerte, fallback, rollback et données à conserver pour diagnostiquer un incident.

:::indice
Un système observable permet de répondre à trois questions : que s'est-il passé, pour qui, et depuis quand ?
:::

:::solution
Le runbook doit relier métriques et actions. Il précise les seuils, les responsables, les mécanismes de dégradation et la procédure de retour à une version connue.
:::

## À retenir
- La qualité AI est aussi une propriété opérationnelle.
- Les fallbacks et limites doivent être conçus avant l'incident.
- Un produit AI doit être mesurable de bout en bout.
