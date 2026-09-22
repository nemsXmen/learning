---
id: ai-dl-regularisation
title: "Régularisation et stabilité de l'entraînement"
slug: regularisation
technology: ai-engineering
level: intermediate
module: deep-learning
order: 4
estimatedMinutes: 60
difficulty: 4
xp: 140
prerequisites: [ai-dl-training]
skills: [ai-pytorch]
tags: [deep-learning, pytorch]
---

## Objectifs
- reconnaître overfitting et instabilité ;
- comprendre dropout et weight decay ;
- distinguer régularisation et normalisation ;
- utiliser early stopping et checkpoints.

## Overfitting
Si train progresse alors que validation se dégrade, le modèle peut mémoriser les particularités du train. Solutions possibles : plus de données, augmentation adaptée, modèle plus simple, weight decay, dropout ou arrêt anticipé.

## Dropout
Pendant l'entraînement, dropout désactive aléatoirement certaines activations. En évaluation, model.eval désactive ce comportement.

## Weight decay
```python
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-2)
```

## Normalisation
BatchNorm et LayerNorm peuvent stabiliser l'apprentissage selon l'architecture. Ils ne sont pas interchangeables avec dropout. Les Transformers utilisent notamment LayerNorm.

## Gradient clipping
```python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

Le clipping peut masquer une cause racine : inspecte aussi gradients et données.

## Early stopping
Surveille une métrique de validation et conserve le meilleur checkpoint. Définis patience et métrique avant l'expérience.

## Exercices
Validation dégradée, train excellent, modèle très grand. Propose trois expériences contrôlées.

:::indice
Observe shape, loss et gradients avant de modifier plusieurs paramètres à la fois.
:::

:::solution
Comparer modèle plus petit, weight decay différent et dropout différent en gardant dataset, seed, protocole et budget constants.

:::

## À retenir
La régularisation est une réponse à un problème observé. Elle doit être expérimentée et mesurée.

## Introduction

La régularisation cherche à améliorer la généralisation du réseau.

## Concept

Dropout, weight decay, normalisation, early stopping et augmentation agissent sur des mécanismes différents.

## Exemple

Si la loss train baisse tandis que validation stagne, une stratégie de régularisation peut être pertinente.

## Comment ça fonctionne

training → validation → diagnostic → régularisation → comparaison

## Questions d'entretien

- Que révèle un écart train/validation important ?

  :::indice
  Relie la question au comportement réel d'un entraînement.
  :::

  :::reponse
  Il peut indiquer un surapprentissage et nécessite d'analyser données, capacité du modèle et régularisation.
  :::
