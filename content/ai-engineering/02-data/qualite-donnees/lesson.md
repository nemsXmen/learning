---
id: ai-data-quality
title: "Qualité des données et preprocessing pour l'IA"
slug: qualite-donnees
technology: ai-engineering
level: beginner
module: data
order: 2
estimatedMinutes: 55
difficulty: 3
xp: 120
prerequisites: [ai-python-fondamentaux, ai-data-modelisation]
skills: [ai-data-quality]
tags: [data-quality, preprocessing, leakage]
---

## Objectifs

- mesurer complétude, validité, unicité et fraîcheur ;
- normaliser sans détruire l'information utile ;
- détecter doublons, données manquantes et anomalies ;
- prévenir la fuite de données ;
- automatiser les contrôles.

## Qualité observable

Une donnée peut être syntaxiquement valide mais inutilisable : texte vide, langue inattendue, date impossible, doublon, contenu obsolète, PII non autorisée ou label contradictoire.

| Dimension | Exemple |
| --- | --- |
| complétude | champs présents |
| validité | respect du schéma |
| unicité | taux de doublons |
| fraîcheur | âge des données |
| cohérence | relations métier |
| couverture | représentation des cas importants |

## Normalisation

```python
def normalize(text: str) -> str:
    return " ".join(text.replace("\r", " ").split())
```

Le preprocessing doit répondre à un besoin mesuré. Supprimer systématiquement ponctuation, accents ou structure peut dégrader certaines tâches.

## Données manquantes

On peut supprimer, imputer ou conserver explicitement l'absence. Le choix dépend de la cause et de la tâche ; l'absence peut elle-même être informative.

## Doublons

Les doublons exacts sont simples à détecter. Les quasi-doublons demandent une comparaison plus coûteuse. Pour un RAG, dédupliquer avant embedding peut réduire coût et bruit.

## Fuite de données

Une fuite arrive lorsqu'une information indisponible au moment de la prédiction influence entraînement ou évaluation. Les transformations qui apprennent des statistiques doivent être ajustées sur train puis appliquées à validation/test.

## Contrôle automatisé

```json
{
  "rows": 120000,
  "duplicate_rate": 0.014,
  "missing_title_rate": 0.002,
  "invalid_language_rate": 0.001,
  "status": "pass"
}
```

Versionne les règles et leurs seuils.

## Exercices

Définis cinq règles de qualité pour un corpus documentaire RAG.

:::indice
Identifie d'abord les invariants, puis vérifie les données avant de produire la sortie.
:::

:::solution

1. text non vide ;
2. taille dans une plage raisonnable ;
3. source_id unique par version ;
4. langue supportée ;
5. source et date de mise à jour présentes.

:::

## À retenir

Le preprocessing n'est pas décoratif. Une mauvaise donnée peut produire un système techniquement fonctionnel mais scientifiquement trompeur.


## Introduction

La qualité des données conditionne directement la qualité d'un système AI.

## Concept

Il faut distinguer complétude, validité, cohérence, fraîcheur, unicité et absence de fuite.

## Exemple

Un contrôle peut refuser un dataset dont un champ critique dépasse un seuil de valeurs nulles.

## Comment ça fonctionne

source → contrôles → rapport → correction → dataset accepté

## Questions d'entretien

- Pourquoi une fuite de données est-elle dangereuse ?

  :::indice
  Pense à la reproductibilité et aux erreurs silencieuses.
  :::

  :::reponse
  Elle produit une évaluation artificiellement bonne et masque la performance réelle en production.
  :::
