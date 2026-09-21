---
id: ai-12-deployment
title: "Déploiement d'applications IA"
slug: deployment
technology: ai-engineering
level: advanced
module: 12-production
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

## Exercice
Une nouvelle version du modèle augmente les erreurs. Quelle procédure ?

### Solution
Réduire le trafic, comparer les métriques, conserver l'ancienne version et effectuer un rollback si nécessaire.

## À retenir
Un déploiement IA doit être réversible et observable.
