---
id: ai-15-launch
title: "Capstone : lancer, observer et faire évoluer"
slug: launch
technology: ai-engineering
level: expert
module: 15-capstone
order: 4
estimatedMinutes: 100
difficulty: 5
xp: 250
prerequisites: [ai-15-evaluate]
skills: [ai-capstone]
tags: [capstone, architecture, rag, agents, production]
---

## Objectifs
- préparer un lancement progressif ;
- exploiter métriques et traces ;
- gérer incidents et coûts ;
- savoir rollbacker.

## Production
Utilise au minimum environnements séparés, secrets gérés, migrations contrôlées, CI/CD, health checks et rollback.

## Progressive delivery
```text
staging -> internal users -> small cohort -> wider rollout
                    |
                 monitor
                    |
              rollback if needed
```

Surveille erreurs, p95/p99, coût par tâche, quotas, consommation tokens, qualité d'évaluation et incidents de sécurité.

## Runbook
Chaque incident important doit avoir une procédure : détection, mitigation, décision de rollback, collecte des preuves et postmortem.

## Évolution
Après lancement, les changements de prompts, modèles, retrieval et tools doivent rester versionnés et évalués.

## Exercice
Le coût par tâche double après un changement de modèle alors que la qualité reste stable. Que vérifier ?

### Solution
Comparer tokens d'entrée/sortie, contexte récupéré, retries, latence, taille des réponses et tarif fournisseur. Corriger la cause avant de généraliser le changement.

## À retenir
Le lancement n'est pas la fin du capstone : c'est le début de son cycle d'exploitation.
