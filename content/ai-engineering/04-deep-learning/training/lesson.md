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
- comprendre forward, loss, backward et update ;
- choisir une loss adaptée ;
- comprendre learning rate et batch size ;
- diagnostiquer un entraînement instable.

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
Un entraînement devient NaN. Donne une stratégie de diagnostic.

:::indice
Observe shape, loss et gradients avant de modifier plusieurs paramètres à la fois.
:::

:::solution
Vérifie données, labels, valeurs extrêmes, learning rate, gradients, mixed precision et opérations produisant inf/NaN. Reproduis avec un petit batch déterministe.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
Entraîner un réseau est une expérience contrôlée. Chaque changement doit être mesuré et relié à une hypothèse.

## Introduction

L'entraînement ajuste les paramètres pour réduire une fonction de perte.

## Concept

Forward, loss, backward et optimizer.step constituent la boucle fondamentale.

## Exemple

Un gradient NaN impose de vérifier données, learning rate, opérations instables et précision numérique.

## Comment ça fonctionne

batch → forward → loss → backward → update → metrics

## Questions d'entretien

- Pourquoi sauvegarder des checkpoints ?

  :::indice
  Relie la question au comportement réel d'un entraînement.
  :::

  :::reponse
  Pour reprendre, comparer des états et revenir à une version connue du modèle.
  :::
