---
id: ai-12-deployment
title: "Déploiement d'applications IA"
slug: deployment
technology: ai-engineering
level: advanced
module: production
order: 1
estimatedMinutes: 75
difficulty: 4
xp: 160
prerequisites: [ai-11-serving]
skills: [ai-production]
tags: [production, reliability, observability]
---

## Objectifs
- déployer API, workers et modèles ;
- gérer configuration et secrets ;
- créer des releases reproductibles ;
- prévoir rollback.

## Architecture
```text
web -> API -> queue -> workers
          |        |
       database   model service
```

Sépare les responsabilités pour scaler chaque composant selon sa charge.

## Reproductibilité
Pin les dépendances, versionne les artefacts et garde la configuration hors du code.

## Rollback
Une release doit pouvoir revenir à une version connue sans perdre les données compatibles.

## Exercices
- Un déploiement AI peut échouer sans erreur technique visible : qualité, coût ou latence peuvent se dégrader. Les critères de release doivent donc couvrir ces dimensions.

:::indice
- Une nouvelle version du modèle augmente les erreurs. Quelle procédure ?
:::
:::solution
Commence par contenir l'impact avant de modifier davantage le système.
:::
## Erreurs fréquentes

Le flow est : build → artefacts versionnés → staging → vérification → canary/rollout → production → rollback. Les migrations de données doivent être conçues pour rester compatibles pendant la transition.

## À retenir

Réduire le trafic vers la version fautive, comparer les métriques, conserver l'ancienne version et effectuer un rollback si nécessaire, puis analyser la cause.

## Introduction

Déployer sans perdre la reproductibilité

## Concept

Une application AI est un ensemble de composants : API, workers, base, stockage, recherche et parfois service de modèle. Une release doit identifier exactement les versions qui composent cet ensemble.

## Exemple

Un artefact déployable doit figer les dépendances et référencer la version du modèle, du prompt et des migrations compatibles. La configuration et les secrets restent séparés du code.

## Comment ça fonctionne

Une nouvelle version du modèle augmente les erreurs après déploiement. Si l'ancienne version est encore disponible, on peut réduire le trafic vers la nouvelle, comparer les métriques puis revenir à la version connue.

## Questions d'entretien
- Un déploiement AI doit être reproductible, observable et réversible.

:::indice
Relie ta réponse à une contrainte opérationnelle concrète.
:::
:::reponse
Pourquoi garder un rollback prêt ?
:::