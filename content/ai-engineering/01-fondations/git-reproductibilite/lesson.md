---
id: ai-git-reproductibilite
title: "Git et reproductibilité : rendre une expérience traçable"
slug: git-reproductibilite
technology: ai-engineering
level: beginner
module: fondations
order: 3
estimatedMinutes: 60
difficulty: 2
xp: 100
prerequisites: [ai-linux-cli]
skills: [ai-git]
tags: [git, reproducibility, experiments]
---

## Objectifs

## Introduction

Une expérience IA doit être traçable au-delà du simple code source : données, modèle, paramètres et environnement influencent le résultat.

## Concept

Git versionne principalement le code et les fichiers du dépôt. La reproductibilité complète exige d'identifier les autres dépendances de l'expérience.

## Exemple

Un run peut conserver le commit, la version du dataset, le modèle, les hyperparamètres, le seed et le jeu d'évaluation.

## Comment ça fonctionne

Les commits et branches structurent l'historique, tandis que des métadonnées d'expérience permettent de comparer des runs et de diagnostiquer une régression.


- comprendre commit, branche et historique ;
- produire des changements petits et traçables ;
- relier code, configuration et expérience ;
- éviter qu'une expérimentation IA devienne impossible à reproduire ;
- distinguer reproductibilité du code et reproductibilité d'un résultat ML.

## Le vrai problème : « ça marchait hier »

Une expérience IA dépend rarement du seul fichier Python.

Elle peut dépendre de :

```text
code
+ dépendances
+ données
+ configuration
+ version du modèle
+ seed
+ matériel
```

Git peut tracer une partie de cette histoire, mais pas automatiquement toutes les variables. La reproductibilité est donc une discipline d'ingénierie, pas simplement l'utilisation de `git commit`.

## Commit : une unité de changement compréhensible

Un bon commit répond à une question précise.

Mauvais exemple conceptuel :

```text
fix stuff
```

Meilleur exemple :

```text
eval: add French regression cases
```

Un commit petit et cohérent facilite :

- la revue ;
- le rollback ;
- le `git bisect` ;
- la comparaison d'expériences ;
- la compréhension de l'historique.

## Branche et expérimentation

Une branche isole une ligne de travail.

Pour une expérimentation :

```text
main
 └── experiment/rag-reranker
       ├── retrieval change
       ├── evaluation dataset
       └── benchmark result
```

L'objectif n'est pas de créer des branches pour tout. L'objectif est d'éviter qu'une expérience non validée devienne indistinguable du code de production.

## Ce que Git ne versionne pas automatiquement

Un fichier de code peut être identique alors que le résultat change parce que :

- le dataset a changé ;
- la version d'une dépendance a changé ;
- le fournisseur de modèle a changé ;
- les paramètres ont changé ;
- le modèle téléchargé n'est plus le même ;
- l'environnement matériel diffère.

Pour une expérience sérieuse, conserve donc des métadonnées explicites.

Exemple :

```yaml
commit: abc123
dataset_version: support-v4
model: example-model
temperature: 0.0
seed: 42
evaluation_set: golden-v2
```

## Reproductibilité : trois niveaux

### 1. Reproductibilité logicielle

Peut-on reconstruire le même environnement ?

### 2. Reproductibilité expérimentale

Peut-on relancer la même expérience avec les mêmes données, paramètres et version de modèle ?

### 3. Reproductibilité comportementale

Le système respecte-t-il les mêmes critères de qualité, même si certaines opérations non déterministes produisent des sorties différentes ?

Cette dernière distinction est importante pour les LLM : « même sortie exacte » n'est pas toujours le bon objectif.

## Git bisect : retrouver une régression

Lorsque la qualité passe de correcte à mauvaise entre deux commits, `git bisect` peut rechercher automatiquement le changement fautif.

Le raisonnement est binaire :

```text
bon ───────────── mauvais
       ↓
   moitié testée
       ↓
    zone réduite
```

Pour que cela fonctionne, il faut un test fiable qui dise « bon » ou « mauvais ».

## Erreurs fréquentes

- mettre des datasets volumineux ou secrets dans Git ;
- faire des commits qui mélangent refactor, fonctionnalité et expérimentation ;
- modifier le code sans enregistrer les paramètres de l'expérience ;
- croire qu'un commit suffit à garantir la reproductibilité ;
- réécrire l'historique partagé sans coordination.

## Exercices
- Définis les métadonnées minimales à conserver pour comparer deux expériences de classification.
  - Une régression apparaît après dix commits. Quel outil Git peut aider à identifier le commit fautif ?
  - Pourquoi un même commit peut-il produire des résultats différents sur deux machines ?

:::indice
Liste séparément ce qui vient du code et ce qui vient de l'environnement, des données et du modèle.
:::
:::solution
Conserve au minimum la version du code, du dataset, du modèle, les hyperparamètres et les informations nécessaires sur l'environnement. `git bisect` permet de rechercher une régression dans l'historique. Deux machines peuvent différer par les dépendances, le matériel, les bibliothèques numériques ou le comportement non déterministe.
:::
## À retenir

En AI Engineering, une expérience sans trace exploitable est difficile à comparer et presque impossible à auditer. Git est le socle de traçabilité du code ; la reproductibilité complète demande de versionner aussi les données, modèles, paramètres et résultats pertinents.

## Questions d'entretien
- Pourquoi un commit Git ne suffit-il pas à reproduire une expérience LLM ?
  - Dans quel cas utiliser git bisect ?
  - Que faut-il conserver pour comparer proprement deux runs d'évaluation ?

:::indice
Pense au système complet, pas uniquement au dépôt Git.
:::
:::reponse
Un commit ne fixe pas forcément les données, dépendances, modèle ou paramètres d'exécution. `git bisect` est utile pour isoler une régression introduite dans l'historique. Pour comparer deux runs, il faut au minimum identifier le code, les données, le modèle, les paramètres et le jeu d'évaluation.
:::