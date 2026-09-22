---
id: ai-data-quality
title: "Qualité des données : mesurer avant de nettoyer"
slug: qualite-donnees
technology: ai-engineering
level: beginner
module: data
order: 2
estimatedMinutes: 65
difficulty: 3
xp: 120
prerequisites: [ai-python-fondamentaux, ai-data-modelisation]
skills: [ai-data-quality]
tags: [data-quality, preprocessing, leakage]
---

## Objectifs

À la fin de cette leçon, tu dois pouvoir définir les critères de qualité d'un dataset, mesurer les défauts importants, choisir un preprocessing adapté à la tâche et détecter les principales formes de fuite de données.

## Introduction

Un modèle ne peut pas compenser indéfiniment une donnée mal définie.

Prenons un corpus documentaire contenant des titres vides, des documents dupliqués et des pages obsolètes. Le pipeline peut parfaitement réussir à créer des embeddings et remplir une base vectorielle. Pourtant, le système final peut récupérer de mauvais passages.

C'est pourquoi la qualité des données doit être traitée comme une propriété mesurable du pipeline, et non comme une étape de nettoyage esthétique.

## Concept

On peut examiner plusieurs dimensions :

| Dimension | Question |
| --- | --- |
| Complétude | Les informations nécessaires sont-elles présentes ? |
| Validité | Les valeurs respectent-elles le schéma ? |
| Unicité | Existe-t-il des doublons indésirables ? |
| Fraîcheur | Les données sont-elles suffisamment récentes ? |
| Cohérence | Les relations métier restent-elles compatibles ? |
| Couverture | Les cas importants sont-ils représentés ? |

Il n'existe pas de seuil universel. Un taux de doublons acceptable pour une analyse exploratoire peut être inacceptable pour un index RAG où chaque doublon augmente le bruit et le coût.

## Exemple

Une normalisation simple peut être utile :

```python
def normalize(text: str) -> str:
    return " ".join(text.replace("\r", " ").split())
```

Mais cela ne signifie pas que toute normalisation est bénéfique.

Supprimer les accents peut dégrader une recherche multilingue. Supprimer les nombres peut détruire des références de factures. Supprimer toute ponctuation peut modifier le sens de certaines expressions.

Le bon preprocessing est donc celui dont l'effet est mesuré sur la tâche réelle.

## Comment ça fonctionne

Un contrôle de qualité suit généralement ce flux :

```text
source
  ↓
profilage
  ↓
règles de qualité
  ↓
rapport
  ↓
acceptation ou rejet
  ↓
dataset versionné
```

Par exemple :

```json
{
  "rows": 120000,
  "duplicate_rate": 0.014,
  "missing_title_rate": 0.002,
  "invalid_language_rate": 0.001,
  "status": "pass"
}
```

Le nombre n'a de sens que si une règle lui est associée. Si `duplicate_rate > 0.02`, le pipeline peut bloquer l'indexation, créer une alerte et conserver le rapport pour audit.

## Valeurs manquantes

Une valeur absente n'a pas toujours la même signification.

```text
inconnue
non applicable
non collectée
perdue
volontairement absente
```

Remplacer toutes les valeurs manquantes par une moyenne sans comprendre leur origine peut introduire un biais.

Dans certains modèles, le fait qu'une valeur soit absente constitue même une information prédictive. La décision doit donc dépendre de la tâche et de la cause de l'absence.

## Fuite de données

La fuite apparaît lorsqu'une information qui ne devrait pas être disponible au moment de la prédiction influence l'entraînement ou l'évaluation.

Une erreur classique consiste à calculer une statistique sur train et test ensemble :

```text
train + test
    ↓
statistiques
    ↓
transformation
```

La bonne séquence est :

```text
train
  ↓
fit transformation
  ↓
transform train
transform validation
transform test
```

Il existe aussi une fuite temporelle. Si nous prédisons l'état d'une transaction au lundi et utilisons une information créée le mardi, notre évaluation est artificiellement optimiste.

## Erreurs fréquentes

- nettoyer mécaniquement sans mesurer l'effet ;
- traiter toutes les valeurs manquantes de la même manière ;
- calculer des statistiques à partir du test ;
- ignorer les contraintes temporelles ;
- définir des seuils sans définir l'action correspondante ;
- confondre dataset volumineux et dataset représentatif.

## Exercices
- Définis cinq règles de qualité pour un corpus RAG.
  - Donne un exemple de fuite temporelle.
  - Un dataset possède 1 % de doublons. Peut-on conclure qu'il est de bonne qualité ?

:::indice
Un seuil n'est jamais une vérité universelle. Relie chaque règle au risque qu'elle cherche à contrôler.
::

:::solution
Un corpus RAG peut contrôler texte non vide, taille raisonnable, source/version présents, langue supportée et unicité. Une fuite temporelle consiste à utiliser une information apparue après le moment où la prédiction aurait réellement été faite. 1 % de doublons ne permet pas à lui seul de conclure : il faut connaître la nature des doublons, leur impact et les exigences du système.
::
## À retenir

La qualité des données commence par une définition claire de ce que le système attend. On mesure ensuite, on agit sur les défauts importants et on vérifie que le nettoyage améliore réellement la tâche.

## Questions d'entretien
- Pourquoi un preprocessing peut-il dégrader un système IA ?
  - Comment reconnais-tu une fuite de données ?
  - Pourquoi un seuil de qualité doit-il être associé à une action ?

:::indice
Pense au pipeline complet : donnée, transformation, modèle, production.
::

:::reponse
Un preprocessing peut supprimer une information utile. Une fuite se reconnaît lorsqu'une information indisponible au moment réel de la prédiction influence le système. Un seuil doit déclencher une décision claire comme accepter, bloquer, alerter ou demander une correction.
::