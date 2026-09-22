---
id: ai-data-versioning
title: "Versionner datasets et artefacts AI"
slug: datasets-versioning
technology: ai-engineering
level: intermediate
module: data
order: 3
estimatedMinutes: 50
difficulty: 3
xp: 110
prerequisites: [ai-data-modelisation, ai-git-reproductibilite]
skills: [ai-experimentation]
tags: [datasets, versioning, lineage]
---

## Objectifs

- versionner un dataset autrement qu'avec un nom de fichier ;
- conserver la lineage entre source, transformation et résultat ;
- identifier les artefacts immuables ;
- rendre entraînement et évaluation rejouables.

## Dataset de référence

Un dataset d'évaluation doit être traité comme un artefact versionné :

```text
name: support-gold
version: 3
sha256: ...
```

Le hash vérifie l'intégrité, mais ne remplace pas une stratégie de stockage et de versionnement.

## Lineage

```text
source -> raw -> cleaned -> chunks -> embeddings -> index
                    |
                    -> eval-set
```

Chaque étape doit connaître l'identité de son entrée.

## Éviter la contamination du test

Si les exemples de test servent à choisir manuellement prompts, règles ou paramètres, le test cesse d'être indépendant. Garde un jeu de référence réservé à la mesure finale.

## Artefacts

Selon le projet, conserver manifest dataset, configuration de preprocessing, identifiants de modèles, index, mapping chunk/document, résultats d'évaluation et commit Git.

## Hash de contenu

```python
import hashlib
digest = hashlib.sha256(data).hexdigest()
```

## Exercices

- Conçois le manifeste d'une version de dataset.

:::indice
Identifie d'abord les invariants, puis vérifie les données avant de produire la sortie.
:::

:::solution

```json
{
  "name": "support",
  "version": 4,
  "source": "crm",
  "rows": 120000,
  "sha256": "...",
  "schema_version": 2,
  "created_at": "2026-09-21T10:00:00Z"
}
```

:::

## À retenir

La version d'un dataset fait partie du contexte expérimental. Sans lineage, une métrique ne permet pas de savoir précisément ce qui a été évalué.


## Introduction

Un dataset AI doit être traçable comme du code.

## Concept

Version, provenance, transformation et partition doivent être reproductibles.

## Exemple

Associer un hash de dataset à une expérience permet de retrouver exactement les données utilisées.

## Comment ça fonctionne

source → snapshot → transformation → version → expérience

## Questions d'entretien

- Que faut-il pouvoir retrouver après une expérience ?

  :::indice
  Pense à la reproductibilité et aux erreurs silencieuses.
  :::

  :::reponse
  La version des données, du code, de la configuration et du modèle.
  :::
