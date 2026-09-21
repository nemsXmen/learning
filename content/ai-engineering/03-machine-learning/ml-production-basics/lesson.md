---
id: ai-ml-production
title: "ML en production : training, inference et monitoring"
slug: ml-production-basics
technology: ai-engineering
level: intermediate
module: machine-learning
order: 4
estimatedMinutes: 55
difficulty: 4
xp: 130
prerequisites: [ai-model-selection]
skills: [ai-model-selection]
tags: [mlops, serving, monitoring, drift]
---

## Objectifs

- séparer entraînement et inférence ;
- versionner modèle et preprocessing ;
- définir un contrat de prédiction ;
- détecter dérive et dégradation ;
- préparer un rollback.

## Training vs inference

Le training produit un artefact versionné. L'inférence charge cet artefact et applique exactement les transformations attendues.

```text
data -> preprocessing -> model -> prediction
```

Le preprocessing doit rester cohérent entre entraînement et production.

## Contrat d'inférence

```json
{
  "customer_id": "42",
  "features": {
    "amount_7d": 125.4,
    "transactions_7d": 7
  }
}
```

Une réponse peut contenir score et model_version. Le contrat doit définir validation, erreurs et version.

## Monitoring

Surveille disponibilité, latence, erreurs, distribution des entrées, distribution des scores et métriques métier lorsque les labels arrivent.

Une dérive de données est un signal d'investigation ; elle ne prouve pas à elle seule une dégradation.

## Rollback

Un modèle doit pouvoir être remplacé rapidement par une version connue. Conserve son identifiant dans les traces lorsque l'audit l'exige.

## Exercice

Un modèle offline a 92 % de précision mais le taux d'erreur métier augmente après déploiement. Donne quatre pistes.

### Solution

Vérifier changement de distribution, preprocessing train/production, seuil, qualité des labels et comportement du service. Comparer périodes et sous-groupes.

## À retenir

Le modèle n'est qu'un composant. L'AI Engineer construit contrats, versioning, serving, monitoring et rollback autour de lui.


## Introduction

Passer en production transforme un modèle en composant opérationnel.

## Concept

Version, monitoring, drift, rollback et contrat d'inférence sont aussi importants que la métrique offline.

## Exemple

Un modèle peut garder son score historique tout en recevant une distribution de données devenue différente.

## Comment ça fonctionne

training → registry → deployment → monitoring → retraining/rollback

## Questions d'entretien

- Que surveiller après déploiement ?

  :::indice
  Pense au risque de mesure trompeuse et à la généralisation.
  :::

  :::reponse
  Erreurs, latence, distribution des entrées, qualité disponible et dérive du comportement.
  :::
