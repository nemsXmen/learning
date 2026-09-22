---
id: ai-data-pipelines
title: "Pipelines de données et feature engineering"
slug: pipelines-features
technology: ai-engineering
level: intermediate
module: data
order: 4
estimatedMinutes: 55
difficulty: 3
xp: 120
prerequisites: [ai-data-quality, ai-data-modelisation]
skills: [ai-experimentation]
tags: [pipelines, features, batch, streaming]
---

## Objectifs

- structurer un pipeline en étapes idempotentes ;
- distinguer batch et streaming ;
- comprendre les features ;
- gérer retries et erreurs sans doublons.

## Pipeline par étapes

```text
extract -> validate -> transform -> enrich -> persist -> index
```

Chaque étape possède entrée, sortie et règles d'échec.

## Idempotence

Un job relancé après panne ne doit pas créer deux fois le même résultat. Les techniques courantes sont clé unique, upsert, transaction, checkpoint et identifiant de run.

## Batch et streaming

Batch traite un ensemble périodiquement. Streaming traite les événements au fil de leur arrivée. Le choix dépend de fraîcheur, coût, complexité et garanties de livraison.

## Feature engineering

Une feature est une représentation utilisée par un modèle :

```text
transaction_amount
transactions_7d
customer_tenure_days
```

Elle doit être disponible au moment de la prédiction. Une feature calculée avec une information future crée une fuite.

## Cohérence train/production

Les transformations apprises doivent être identiques entre entraînement et prédiction. Versionne donc la logique de transformation et évite les traitements manuels non reproductibles.

## Exercices

- Conçois un pipeline d'ingestion relançable sans duplication de chunks.

:::indice
Identifie d'abord les invariants, puis vérifie les données avant de produire la sortie.
:::

:::solution

Utilise une clé déterministe basée sur document_id + document_version + chunk_position, puis un upsert. Enregistre aussi version du pipeline et du chunker/tokenizer.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir

Un pipeline AI fiable est une chaîne de contrats. Validation, idempotence, lineage et cohérence des transformations comptent autant que l'algorithme final.


## Introduction

Les pipelines transforment des données brutes en entrées exploitables par les modèles.

## Concept

Une feature doit avoir une définition, une source, une temporalité et une règle de calcul.

## Exemple

Une feature calculée à partir d'événements futurs crée une fuite temporelle.

## Comment ça fonctionne

events → validation → transformation → features → training/serving

## Questions d'entretien

- Pourquoi l'idempotence est-elle utile ?

  :::indice
  Pense à la reproductibilité et aux erreurs silencieuses.
  :::

  :::reponse
  Un même traitement peut être rejoué sans produire de doublons ou d'état incohérent.
  :::
