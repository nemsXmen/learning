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
skills: [ai-engineering]
tags: [ai, production, engineering]
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

Sépare les responsabilités pour pouvoir scaler chaque composant selon sa charge.

## Reproductibilité
Pin les dépendances, versionne les artefacts et garde la configuration hors du code.

## Rollback
Une release doit pouvoir revenir à une version connue sans perdre les données compatibles.

## Exercice
Une nouvelle version du modèle augmente les erreurs après déploiement. Quelle procédure ?

### Solution
Stopper ou réduire le trafic, comparer métriques, conserver l'ancienne version et effectuer un rollback si le seuil critique est dépassé.

## À retenir
Un déploiement IA doit être réversible et observable.
