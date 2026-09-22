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
prerequisites: [ai-ml-validation]
skills: [ai-model-selection]
tags: [mlops, serving, monitoring, drift]
---

## Objectifs

À la fin de ce chapitre, tu dois pouvoir distinguer training et inference, versionner les artefacts nécessaires à une prédiction, définir un contrat d'inférence et préparer le monitoring et le rollback.

## Introduction

Un notebook qui produit 92 % de précision n'est pas encore un système de production. En production, il faut pouvoir charger la bonne version du modèle, appliquer les mêmes transformations que pendant l'entraînement, répondre dans un délai acceptable et comprendre ce qui se passe lorsqu'une donnée change.

L'AI Engineer doit donc construire la chaîne autour du modèle.

## Concept

Le training produit un artefact versionné. L'inférence consomme cet artefact pour transformer une entrée en prédiction.

```text
TRAINING
données → preprocessing → entraînement → artefact modèle
                                      ↓
                                registry/version

INFERENCE
requête → validation → preprocessing → modèle → prédiction
```

Le preprocessing est une partie du modèle au sens opérationnel. Si une feature était normalisée pendant l'entraînement mais ne l'est plus en production, tu ne sers plus exactement le même système.

## Exemple

Une API de scoring peut recevoir :

```json
{
  "customer_id": "42",
  "features": {
    "amount_7d": 125.4,
    "transactions_7d": 7
  }
}
```

Elle peut répondre avec un score et la version du modèle :

```json
{
  "score": 0.83,
  "model_version": "fraud-2026-09-01"
}
```

Le contrat doit également préciser les types, les champs obligatoires, les erreurs possibles et le comportement en cas de version incompatible.

## Comment ça fonctionne

Une fois le modèle déployé, le système doit être observable.

```text
requête
  ↓
validation
  ↓
inférence
  ↓
réponse
  ├── latence
  ├── erreurs
  ├── version modèle
  └── métriques métier
       ↓
    monitoring
       ↓
investigation / retraining / rollback
```

Surveille la disponibilité, les erreurs et la latence, mais aussi la distribution des entrées et des scores. Lorsque les labels arrivent avec retard, ajoute les métriques de qualité réelles.

Une dérive statistique est un signal d'investigation. Elle ne prouve pas, à elle seule, que le modèle est devenu mauvais.

Le rollback doit être préparé avant l'incident. Une version connue du modèle doit pouvoir redevenir active sans reconstruire toute la chaîne.

## Erreurs fréquentes

Une erreur fréquente est de versionner uniquement le fichier du modèle et d'oublier le preprocessing, les dépendances ou la définition des features.

Une autre consiste à surveiller uniquement la latence et les erreurs HTTP. Un service peut être parfaitement disponible tout en produisant des prédictions devenues mauvaises.

## Exercices
- Un modèle offline a 92 % de précision mais le taux d'erreur métier augmente après déploiement. Donne quatre pistes d'investigation.

:::indice
Compare ce qui était vrai pendant l'évaluation offline avec ce qui est réellement envoyé au modèle en production.
:::
:::solution
Vérifier un changement de distribution, le preprocessing train/production, le seuil de décision, la qualité ou le retard des labels, et le comportement par sous-groupe. Comparer les périodes et conserver la version du modèle dans les traces.
:::
## À retenir

Le modèle n'est qu'un composant. Une mise en production fiable nécessite un artefact reproductible, un contrat d'inférence, du monitoring, des traces exploitables et un rollback rapide.

## Questions d'entretien
- Que surveiller après le déploiement d'un modèle ?

:::indice
Sépare les signaux opérationnels des signaux de qualité.
:::
:::reponse
Au minimum les erreurs, la latence et la disponibilité, puis les distributions des entrées et sorties, la dérive et les métriques métier dès que les labels sont disponibles. La version du modèle doit aussi être traçable.
:::