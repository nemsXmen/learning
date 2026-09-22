---
id: ai-ml-supervised
title: "Machine Learning supervisé"
slug: supervise
technology: ai-engineering
level: beginner
module: machine-learning
order: 1
estimatedMinutes: 55
difficulty: 3
xp: 120
prerequisites: [ai-maths, ai-data-quality]
skills: [ai-ml-basics]
tags: [machine-learning, supervised, classification, regression]
---

## Objectifs

À la fin de ce chapitre, tu dois pouvoir expliquer ce qu'un modèle supervisé apprend, choisir entre régression et classification, construire une baseline et relier une métrique à une conséquence métier.

## Introduction

Imagine que tu disposes de milliers de transactions dont tu connais déjà le résultat : fraude ou non fraude. Ton objectif n'est pas de mémoriser ces exemples. Tu veux apprendre une relation qui permettra de produire une estimation sur une nouvelle transaction.

C'est précisément l'idée de l'apprentissage supervisé : pendant l'entraînement, le modèle reçoit des exemples pour lesquels la réponse attendue est connue.

## Concept

On note généralement une observation par $x$ et sa cible par $y$. Le modèle cherche une fonction $f$ telle que $f(x)$ produise une prédiction suffisamment proche de $y$ sur des données qu'il n'a jamais vues.

Dans une application réelle, la chaîne est plus importante que l'algorithme lui-même :

```text
données brutes
    ↓
features + label
    ↓
split train / validation / test
    ↓
baseline
    ↓
entraînement
    ↓
prédictions
    ↓
métrique
    ↓
analyse des erreurs
```

Une régression prédit une quantité numérique, par exemple un montant. Une classification prédit une classe ou une probabilité de classe, par exemple fraude / non-fraude.

## Exemple

Supposons que tu construises un détecteur de fraude. Pour chaque transaction, tu peux avoir le montant, l'ancienneté du compte, le nombre de transactions récentes et une cible indiquant si la transaction a finalement été déclarée frauduleuse.

Avant de chercher un modèle sophistiqué, commence par une règle simple. Par exemple, marque comme suspectes les transactions dépassant un seuil. Cette règle n'est pas forcément bonne, mais elle te donne un point de comparaison.

## Comment ça fonctionne

Le modèle reçoit les features du jeu d'entraînement et produit une prédiction. Une fonction de perte mesure l'écart avec la cible. L'algorithme ajuste alors ses paramètres pour réduire cette perte.

Pour une classification binaire, le modèle peut produire une probabilité :

```text
features → modèle → probabilité de fraude → seuil → décision
```

Le seuil est une décision métier autant qu'une décision technique. Un seuil bas peut détecter davantage de fraudes mais déclencher davantage de faux positifs.

La matrice de confusion permet de rendre ces erreurs visibles : vrai positif, faux positif, vrai négatif et faux négatif.

La précision mesure la proportion des alertes qui sont réellement positives :

```text
precision = TP / (TP + FP)
```

Le rappel mesure la proportion des positifs réellement détectés :

```text
recall = TP / (TP + FN)
```

Pour une régression, MAE mesure l'erreur absolue moyenne tandis que RMSE pénalise davantage les grosses erreurs. Le choix dépend donc de ce que coûte réellement une erreur.

## Erreurs fréquentes

Une erreur classique consiste à choisir un algorithme avant de définir ce qu'est une bonne prédiction. Une autre consiste à regarder uniquement l'accuracy alors que les classes sont déséquilibrées.

Il faut également vérifier la qualité des labels. Un modèle ne peut pas apprendre correctement si la cible est incohérente, retardée ou contaminée par une information indisponible au moment de la prédiction.

## Exercices
- Pour un filtre anti-spam, explique pourquoi le recall seul ne suffit pas et propose un protocole minimal pour comparer deux modèles.

:::indice
Demande-toi ce qui arrive lorsqu'un email légitime est classé comme spam et lorsqu'un spam passe le filtre.
:::
:::solution
Un recall élevé ne garantit pas une bonne précision. Il faut mesurer au minimum precision et recall, examiner la matrice de confusion et fixer un seuil en fonction du coût des deux types d'erreurs. Une baseline simple doit servir de référence.
:::
## À retenir

Un modèle supervisé apprend à partir d'exemples labellisés, mais le vrai objectif est la généralisation. Une bonne démarche commence par les données, le problème et la métrique, puis seulement par le choix du modèle.

## Questions d'entretien
- Pourquoi commencer par une baseline avant d'utiliser un modèle complexe ?

:::indice
Pense à ce que tu risques de ne pas savoir si tu commences directement par un modèle sophistiqué.
:::
:::reponse
La baseline fournit une référence simple et reproductible. Elle permet de vérifier le pipeline de données et de mesurer si la complexité ajoutée apporte réellement une amélioration.
:::