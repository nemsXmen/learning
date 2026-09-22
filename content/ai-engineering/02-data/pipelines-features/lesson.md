---
id: ai-data-pipelines
title: "Pipelines de données et feature engineering"
slug: pipelines-features
technology: ai-engineering
level: intermediate
module: data
order: 4
estimatedMinutes: 70
difficulty: 3
xp: 120
prerequisites: [ai-data-quality, ai-data-modelisation]
skills: [ai-experimentation]
tags: [pipelines, features, batch, streaming, leakage]
---

## Objectifs

## Exemple

Un pipeline de features peut suivre : source → validation → transformation → feature versionnée → entraînement ou serving. La même logique de transformation doit être contrôlée pour éviter le training-serving skew.


À la fin de cette leçon, tu dois pouvoir découper un pipeline en étapes fiables, expliquer l'idempotence, distinguer batch et streaming et construire des features disponibles au bon moment.

## Introduction

Un modèle ne reçoit pas directement la réalité.

Entre un événement métier et une prédiction, plusieurs traitements ont lieu :

```text
événement
  ↓
ingestion
  ↓
validation
  ↓
transformation
  ↓
features
  ↓
modèle
  ↓
prédiction
```

Si une étape est fragile, toute la chaîne devient fragile.

L'objectif d'un pipeline n'est donc pas seulement de transformer des données. Il est de transformer des données de façon prévisible, rejouable et observable.

## Concept

Une étape de pipeline doit avoir un contrat clair :

```text
entrée → transformation → sortie
                  ↓
             erreur explicite
```

Un pipeline typique peut être :

```text
extract → validate → transform → enrich → persist → index
```

Chaque étape doit savoir ce qu'elle accepte, ce qu'elle produit et ce qui se passe lorsqu'elle échoue.

## Exemple : idempotence

Supposons qu'un worker traite le document `doc-42`, écrit ses chunks puis tombe avant de confirmer la fin du job.

Le système redémarre.

Sans idempotence :

```text
premier run → chunks A B C
second run  → chunks A B C
résultat    → A B C A B C
```

Avec une identité déterministe :

```text
document_id + version + position
```

le second run reconnaît les mêmes chunks et peut effectuer un upsert plutôt que créer de nouveaux objets.

L'idempotence signifie ici que rejouer le même traitement ne crée pas un nouvel état incorrect.

## Comment ça fonctionne

Un pipeline robuste doit également gérer les reprises :

```text
job
 ↓
étape réussie
 ↓
checkpoint
 ↓
panne
 ↓
reprise
 ↓
étape restante
```

Selon le système, on peut utiliser des clés uniques, des transactions, des upserts, des checkpoints ou des identifiants de run.

La bonne solution dépend du niveau de garantie nécessaire. Une simple déduplication ne remplace pas une transaction si plusieurs écritures doivent rester atomiques.

## Batch ou streaming ?

En batch, on traite un ensemble de données périodiquement :

```text
00:00 → traiter les événements de la journée
```

En streaming, les événements sont traités au fil de leur arrivée :

```text
event → worker → transformation → résultat
event → worker → transformation → résultat
```

Le streaming n'est pas automatiquement « meilleur ». Il augmente souvent la complexité opérationnelle.

Le choix dépend de la fraîcheur attendue, du volume, du coût, des garanties de livraison et de la complexité acceptable.

## Feature engineering

Une feature est une représentation calculée à partir des données pour être utilisée par un modèle.

Par exemple :

```text
transaction_amount
transactions_7d
customer_tenure_days
```

La question essentielle n'est pas seulement « comment calculer cette feature ? ».

Il faut demander :

> « Cette information était-elle réellement disponible au moment de la prédiction ? »

## Exemple de fuite temporelle

Supposons que nous voulions prédire lundi si une transaction sera frauduleuse.

Nous calculons :

```text
transactions_last_7_days
```

Mais notre pipeline inclut accidentellement les événements arrivés mardi.

Le modèle reçoit alors une information qu'il n'aurait jamais eue en production.

Le score d'évaluation augmente artificiellement et le modèle paraît meilleur qu'il ne l'est réellement.

## Cohérence entre entraînement et production

Une transformation utilisée pendant l'entraînement doit rester cohérente avec celle utilisée au moment de servir le modèle.

On veut :

```text
training data
   ↓
transformation T
   ↓
features
   ↓
model

production event
   ↓
même transformation T
   ↓
features
   ↓
model
```

Une transformation manuelle dans un notebook et une autre implémentation dans l'API sont une source classique de divergence.

## Erreurs fréquentes

- construire un pipeline sans contrats entre étapes ;
- oublier l'idempotence avant d'ajouter des retries ;
- choisir le streaming uniquement parce qu'il semble plus moderne ;
- calculer une feature avec une donnée future ;
- utiliser une transformation différente entre entraînement et production ;
- rendre les reprises impossibles à observer.

## Exercices

- Conçois un pipeline d'ingestion relançable sans duplication de chunks.
- Explique pourquoi un retry naïf peut créer des doublons.
- Donne un exemple de feature qui provoque une fuite temporelle.

:::indice
Commence par définir l'identité de l'objet produit et le moment exact où chaque information devient disponible.
:::

:::solution
Utilise une clé déterministe comme `document_id + version + position` et un mécanisme d'upsert ou de contrainte unique. Un retry naïf répète les écritures déjà effectuées. Une feature calculée avec un événement futur, comme un statut connu après la date de prédiction, provoque une fuite temporelle.
:::

## À retenir

Un pipeline IA est une chaîne de contrats et de garanties. Idempotence, reprise, temporalité et cohérence entre entraînement et production sont aussi importantes que la transformation elle-même.

## Questions d'entretien

- Qu'est-ce que l'idempotence dans un pipeline de données ?
- Quand choisir batch plutôt que streaming ?
- Pourquoi une feature peut-elle être correcte mathématiquement mais incorrecte pour l'entraînement ?

:::indice
La question centrale est toujours : « que pouvait réellement savoir le système à cet instant ? »
:::

:::reponse
L'idempotence permet de rejouer un traitement sans créer un nouvel état incorrect. Le batch convient lorsque la fraîcheur périodique suffit et que sa simplicité est préférable ; le streaming est pertinent lorsque la faible latence est nécessaire. Une feature peut être calculée correctement mais utiliser une information future, créant une fuite de données.
:::
