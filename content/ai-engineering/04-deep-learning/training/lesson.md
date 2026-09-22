---
id: ai-dl-training
title: "Entraîner un réseau : loss, backpropagation et optimisation"
slug: training
technology: ai-engineering
level: intermediate
module: deep-learning
order: 2
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-dl-tensors]
skills: [ai-pytorch]
tags: [deep-learning, pytorch]
---

## Objectifs

À la fin de ce chapitre, tu dois pouvoir expliquer chaque étape d'une boucle d'entraînement, choisir une fonction de perte cohérente et diagnostiquer un entraînement qui diverge ou produit des NaN.

## Boucle d'entraînement
```text
batch -> forward -> loss -> backward -> optimizer.step()
```

```python
optimizer.zero_grad()
predictions = model(inputs)
loss = criterion(predictions, targets)
loss.backward()
optimizer.step()
```

zero_grad évite l'accumulation involontaire des gradients.

## Fonction de perte
Classification multi-classe : cross-entropy. Régression : MSE ou MAE selon l'objectif. Une loss basse n'est pas automatiquement une bonne métrique métier.

## Learning rate
Trop grand : divergence possible. Trop petit : convergence lente. Surveille train et validation.

## Backpropagation
La rétropropagation applique la règle de chaîne pour calculer les dérivées. L'optimiseur transforme ces gradients en mises à jour.

## Diagnostic
Surveille NaN, gradients explosifs, stagnation, validation qui se dégrade et utilisation GPU.

## Exercices

- Un entraînement devient NaN après quelques centaines de steps. Décris ton protocole de diagnostic.

:::indice
Commence par identifier la première étape où apparaît NaN ou inf.
:::

:::solution
Vérifie données et labels, activations et gradients, learning rate, mixed precision et opérations numériques instables. Reproduis avec un petit batch déterministe.
:::

## Erreurs fréquentes

Quand une loss devient NaN, ne change pas immédiatement cinq hyperparamètres. Cherche la première valeur invalide : données, labels, activation, loss ou gradient. Reproduis avec un petit batch déterministe.

## À retenir

L'entraînement est une boucle expérimentale : forward → loss → backward → update. Comprendre chaque étape vaut mieux que modifier les hyperparamètres au hasard.

## Introduction

Un réseau neuronal commence avec des paramètres qui ne donnent généralement pas de bonnes prédictions. L'entraînement consiste à mesurer ses erreurs puis à modifier progressivement ces paramètres.

## Concept

La boucle fondamentale suit : batch → forward → prediction → loss → backward → gradients → optimizer.step() → nouveaux paramètres. zero_grad() est nécessaire parce que PyTorch accumule les gradients par défaut.

## Exemple

Pour une classification multi-classe, une cross-entropy est souvent adaptée. Pour une régression, MSE ou MAE peuvent être utilisées selon le problème. La loss guide l'apprentissage mais n'est pas forcément la métrique métier finale.

## Comment ça fonctionne

Le learning rate contrôle l'amplitude des mises à jour. Trop grand, il peut provoquer oscillations ou divergence ; trop petit, il rend la convergence lente. Le batch size influence aussi le bruit du gradient et la mémoire nécessaire.

## Questions d'entretien

Pourquoi sauvegarder des checkpoints pendant l'entraînement ?

:::indice
Relie ta réponse au fonctionnement concret du système.
:::

:::reponse
Un checkpoint permet de reprendre après une interruption, de comparer des expériences et de revenir à un état connu.
:::
