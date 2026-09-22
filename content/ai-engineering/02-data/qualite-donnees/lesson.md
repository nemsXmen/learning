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

- définir une donnée « de qualité » pour une tâche donnée ;
- mesurer complétude, validité, unicité, fraîcheur et cohérence ;
- choisir un preprocessing sans détruire l'information ;
- détecter la fuite de données ;
- transformer les contrôles en garde-fous automatisés.

## Qualité : par rapport à quoi ?

Il n'existe pas une donnée « propre » dans l'absolu.

Un texte contenant des emojis peut être parfaitement acceptable pour un chatbot et problématique pour un pipeline qui attend un vocabulaire strict.

La bonne question est :

> « Cette donnée respecte-t-elle les invariants nécessaires à cette étape ? »

## Les dimensions à mesurer

| Dimension | Question |
| --- | --- |
| Complétude | Les champs nécessaires sont-ils présents ? |
| Validité | Respectent-ils le schéma attendu ? |
| Unicité | Avons-nous des doublons indésirables ? |
| Fraîcheur | Les données sont-elles assez récentes ? |
| Cohérence | Les relations métier sont-elles compatibles ? |
| Couverture | Les cas importants sont-ils représentés ? |

Ces mesures deviennent des signaux de pipeline.

## Preprocessing : moins n'est pas toujours mieux

Prenons :

```python
def normalize(text: str) -> str:
    return " ".join(text.replace("\r", " ").split())
```

Cette transformation retire certains espaces inutiles, mais elle ne prétend pas résoudre tous les problèmes.

Supprimer systématiquement :

- ponctuation ;
- accents ;
- majuscules ;
- nombres ;
- structure Markdown ;

peut détruire une information utile.

Le preprocessing doit donc être justifié par la tâche et mesuré sur un jeu d'évaluation.

## Valeurs manquantes

Une valeur manquante peut signifier plusieurs choses :

```text
inconnue
non applicable
non collectée
perdue
volontairement absente
```

Remplacer tout par une moyenne sans comprendre la cause peut introduire un biais.

Pour certaines tâches, « missing » est lui-même une information.

## Doublons et quasi-doublons

Deux documents identiques peuvent être supprimés avec une empreinte de contenu.

Les quasi-doublons demandent une méthode plus sophistiquée.

Dans un RAG, les doublons peuvent :

- gaspiller le budget d'indexation ;
- augmenter le bruit du retrieval ;
- faire apparaître plusieurs fois la même information ;
- donner une fausse impression de confiance.

## Fuite de données : le piège silencieux

Supposons que tu calcules une normalisation en utilisant la moyenne de tout le dataset, puis que tu évalues sur le test.

Le test a alors influencé la transformation.

La règle :

```text
fit sur train
↓
transform train
transform validation
transform test
```

Le test doit rester indépendant de la construction du système.

La fuite peut aussi être temporelle :

```text
prédire lundi
avec une information créée mardi
```

Le modèle paraît excellent pendant l'évaluation et échoue lorsqu'il rencontre la réalité.

## Contrôles automatisés

Un pipeline peut produire un rapport :

```json
{
  "rows": 120000,
  "duplicate_rate": 0.014,
  "missing_title_rate": 0.002,
  "invalid_language_rate": 0.001,
  "status": "pass"
}
```

Mais un nombre n'est utile que s'il possède un seuil et une action associée.

Exemple :

```text
duplicate_rate > 2%
→ bloquer l'indexation
→ créer une alerte
→ conserver le rapport
```

## Erreurs fréquentes

- nettoyer mécaniquement sans mesurer l'effet ;
- considérer toutes les valeurs manquantes comme équivalentes ;
- calculer des statistiques sur train + test ;
- oublier les fuites temporelles ;
- utiliser des seuils sans définir l'action associée ;
- confondre dataset volumineux et dataset représentatif.

## Exercices

- Définis cinq contrôles de qualité pour un corpus RAG.
- Donne un exemple de fuite temporelle.
- Un dataset possède 1 % de doublons. Est-ce automatiquement acceptable ?

:::indice
Il n'existe pas de seuil universel : relie chaque contrôle au risque métier et à l'étape du pipeline.
:::

:::solution
Un corpus RAG peut contrôler texte non vide, taille raisonnable, source/version présents, langue supportée et unicité. Une fuite temporelle consiste par exemple à utiliser l'état d'un compte connu après la date de prédiction. 1 % de doublons n'est ni automatiquement bon ni mauvais : il faut connaître le coût, la nature des doublons et le seuil acceptable pour le système.
:::

## À retenir

La qualité des données se définit par rapport à un usage. Mesurer, comprendre la cause, agir et vérifier l'effet est plus robuste que « nettoyer jusqu'à ce que ça ait l'air propre ».

## Questions d'entretien

- Pourquoi le preprocessing peut-il dégrader un modèle ?
- Comment détecter une fuite de données ?
- Pourquoi versionner les règles de qualité ?

:::indice
Relie chaque réponse à la possibilité de régression.
:::

:::reponse
Un preprocessing peut supprimer une information utile. Une fuite se détecte en examinant la disponibilité temporelle des variables et le pipeline de séparation train/validation/test. Versionner les règles permet d'expliquer pourquoi un dataset a été accepté ou refusé à une date donnée.
:::
