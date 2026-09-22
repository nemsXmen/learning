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

À la fin de ce chapitre, tu dois pouvoir reconnaître un surapprentissage, expliquer dropout et weight decay, et construire une expérience permettant de comparer des stratégies de régularisation.

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
- La validation se dégrade alors que le train continue de progresser. Propose trois expériences contrôlées.

:::indice
Chaque expérience doit répondre à une hypothèse précise et modifier idéalement un facteur principal.
:::
:::solution
Comparer un modèle plus petit, une valeur différente de weight decay et une valeur différente de dropout, en conservant le reste du protocole comparable.
:::
## Erreurs fréquentes

Changer simultanément dropout, learning rate, batch size et architecture empêche d'attribuer l'effet observé. Garde le dataset, la seed, le protocole et le budget comparables.

## À retenir

La régularisation est un outil de généralisation. Elle doit partir d'un diagnostic et être évaluée avec une expérience reproductible.

## Introduction

Imagine un modèle dont la performance sur train progresse alors que celle de validation se dégrade. Le modèle apprend les données connues mais généralise moins bien. C'est le signal classique d'un surapprentissage.

## Concept

La régularisation cherche à améliorer la généralisation. Les leviers sont différents : davantage de données, augmentation adaptée, modèle plus simple, dropout, weight decay ou early stopping.

## Exemple

Dropout désactive aléatoirement certaines activations pendant l'entraînement. Weight decay pénalise les poids selon la règle de l'optimiseur. BatchNorm et LayerNorm répondent à des problématiques de normalisation différentes.

## Comment ça fonctionne

Flow expérimental : training → validation → diagnostic → modification contrôlée → comparaison. Le gradient clipping peut limiter des gradients trop grands, mais il ne doit pas masquer une cause racine. L'early stopping conserve le meilleur checkpoint selon une métrique définie à l'avance.

## Questions d'entretien
- Que révèle un écart train/validation important ?

:::indice
Relie ta réponse au fonctionnement concret du système.
:::
:::reponse
Il peut signaler du surapprentissage, mais aussi un changement de distribution, un problème de données ou un protocole de validation inadéquat. Il faut diagnostiquer avant de choisir une correction.
:::