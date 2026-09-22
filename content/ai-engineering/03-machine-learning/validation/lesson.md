---
id: ai-ml-validation
title: "Validation, généralisation et sélection de modèles"
slug: validation
technology: ai-engineering
level: intermediate
module: machine-learning
order: 3
estimatedMinutes: 60
difficulty: 4
xp: 130
prerequisites: [ai-ml-supervised, ai-data-versioning]
skills: [ai-model-selection]
tags: [validation, cross-validation, leakage, generalization]
---

## Objectifs

À la fin de ce chapitre, tu dois pouvoir construire un split cohérent avec le problème, reconnaître un surapprentissage et expliquer pourquoi le jeu de test doit rester indépendant.

## Introduction

Un modèle peut obtenir un excellent score sur les données qu'il a utilisées pour apprendre tout en échouant sur les nouvelles données. Ce n'est pas un détail : la valeur d'un modèle vient précisément de sa capacité à généraliser.

La validation sert donc à répondre à une question simple : « que se passera-t-il lorsque le modèle rencontrera des données qu'il n'a pas vues ? »

## Concept

Un protocole classique sépare les données en trois rôles :

```text
dataset
  ├── train       → apprendre les paramètres
  ├── validation  → choisir / régler
  └── test        → mesurer une fois à la fin
```

Le train sert à apprendre. La validation sert à prendre des décisions de développement. Le test doit rester une estimation finale aussi indépendante que possible.

## Exemple

Imaginons un modèle de fraude. Si des transactions du même client apparaissent à la fois dans train et validation, le modèle peut profiter indirectement de caractéristiques propres à ce client.

Dans une série temporelle, le problème est encore plus évident : mélanger aléatoirement le passé et le futur peut permettre au modèle de bénéficier d'informations qui n'auraient pas été disponibles au moment réel de la prédiction.

## Comment ça fonctionne

Le choix du split dépend donc de la manière dont les données sont produites.

Pour des données indépendantes, un split aléatoire peut convenir. Pour des groupes liés, on peut séparer par groupe. Pour des données temporelles, on respecte l'ordre du temps.

La cross-validation répète l'entraînement sur plusieurs partitions afin d'obtenir une estimation plus robuste, lorsque ses hypothèses sont compatibles avec le problème.

```text
fold 1 → train / validation
fold 2 → train / validation
fold 3 → train / validation
        ↓
agrégation des résultats
```

Mais la cross-validation n'annule pas les risques de fuite. Une transformation calculée sur tout le dataset avant le split peut déjà avoir contaminé l'évaluation.

Les hyperparamètres doivent être choisis avec une procédure de validation. Si tu compares des dizaines de modèles sur le test et conserves celui qui obtient le meilleur score, le test devient lui-même un outil de tuning.

La calibration ajoute une autre dimension. Un modèle peut correctement classer les exemples tout en produisant des probabilités peu fiables. Si un système annonce 0,8 de probabilité, la signification de cette valeur doit être cohérente avec les observations du contexte concerné.

## Erreurs fréquentes

Le piège le plus courant est de choisir un split uniquement parce qu'il est facile à coder. Il faut plutôt partir de la manière dont les données arriveront en production.

Il faut aussi surveiller les doublons, les variables calculées avec des informations futures et les transformations apprises sur des données qui devraient rester hors du train.

## Exercices
- Un modèle obtient 99 % sur train et 72 % sur validation. Donne deux hypothèses et trois vérifications.

:::indice
Le problème peut venir du modèle, des données ou du protocole d'évaluation.
:::
:::solution
Deux hypothèses plausibles sont le surapprentissage et un changement de distribution. Vérifier les distributions train/validation, inspecter les erreurs et les doublons, rechercher les fuites et comparer avec une baseline simple.
:::
## À retenir

Un score n'a de sens que si le protocole qui l'a produit ressemble à l'usage futur. La qualité de la validation est donc une propriété du système de données, pas seulement du modèle.

## Questions d'entretien
- Pourquoi le jeu de test ne doit-il pas servir au tuning ?

:::indice
Demande-toi ce que signifie « estimation indépendante ».
:::
:::reponse
Parce qu'utiliser le test pour prendre des décisions de sélection finit par adapter le modèle au test. Il ne représente alors plus une mesure indépendante de la généralisation.
:::