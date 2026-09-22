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
Une nouvelle version du modèle augmente les erreurs. Quelle procédure ?

:::indice
Raisonne en détection → mitigation → récupération → vérification.
:::

:::solution
Réduire le trafic, comparer les métriques, conserver l'ancienne version et effectuer un rollback si nécessaire.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
Un déploiement IA doit être réversible et observable.


## Introduction

Le déploiement AI doit rendre code, configuration et modèles reproductibles.

## Concept

Environnements, artefacts, migrations et rollback forment un même processus.

## Exemple

Une release peut référencer explicitement version du modèle, prompt et image applicative.

## Comment ça fonctionne

build → artifact → staging → verification → production

## Questions d'entretien

- Pourquoi garder un rollback prêt ?

  :::indice
  Pense aux conséquences d'une panne sous trafic réel.
  :::

  :::reponse
  Parce qu'une régression peut apparaître uniquement avec le trafic réel.
  :::
