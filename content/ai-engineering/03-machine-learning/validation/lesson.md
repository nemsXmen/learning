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
prerequisites: [ai-ml-basics, ai-experimentation]
skills: [ai-model-selection]
tags: [validation, cross-validation, leakage, generalization]
---

## Objectifs

- séparer entraînement, validation et test ;
- comprendre overfitting et underfitting ;
- utiliser la cross-validation lorsque le contexte le permet ;
- éviter de contaminer le test.

## Généralisation

Le but est une bonne performance sur une distribution future, pas une excellente note sur train. Un grand écart train/validation peut signaler surapprentissage ou changement de distribution.

## Split

Le split dépend des données. Pour des observations temporelles, un split aléatoire peut laisser le futur influencer le passé. Pour des groupes liés, séparer les lignes peut aussi créer une fuite.

## Cross-validation

La cross-validation entraîne plusieurs fois sur des partitions différentes et donne une estimation plus robuste dans les contextes où ses hypothèses sont satisfaites. Elle ne doit pas être appliquée aveuglément aux séries temporelles ou données dépendantes.

## Hyperparamètres

Les hyperparamètres sont sélectionnés avec validation ou une procédure de recherche. Le test reste réservé à l'estimation finale.

Comparer de nombreux modèles sur le test puis choisir le meilleur transforme le test en outil de tuning.

## Calibration

Une classification peut bien classer tout en étant mal calibrée. Une probabilité de 0.8 devrait correspondre approximativement à 80 % de positifs dans le contexte mesuré si le modèle est correctement calibré.

## Exercice

Un modèle obtient 99 % sur train et 72 % sur validation. Donne deux hypothèses et trois vérifications.

### Solution

Hypothèses : surapprentissage ou changement de distribution. Vérifications : comparer les distributions, inspecter erreurs, vérifier doublons/fuites et tester une baseline simple.

## À retenir

Un score n'a de sens que si le protocole de validation représente correctement l'usage futur.
