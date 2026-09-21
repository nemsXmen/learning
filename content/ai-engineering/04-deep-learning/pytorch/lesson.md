---
id: ai-dl-pytorch
title: "PyTorch : modèles, datasets et entraînement reproductible"
slug: pytorch
technology: ai-engineering
level: intermediate
module: deep-learning
order: 3
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-dl-tensors, ai-dl-training]
skills: [ai-pytorch]
tags: [deep-learning, pytorch]
---

## Objectifs
- structurer un modèle PyTorch ;
- utiliser Dataset et DataLoader ;
- séparer train et eval ;
- sauvegarder un checkpoint.

## Module
```python
import torch.nn as nn

class Classifier(nn.Module):
    def __init__(self, input_size, hidden, classes):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(input_size, hidden), nn.ReLU(), nn.Linear(hidden, classes))
    def forward(self, x):
        return self.net(x)
```

## Dataset et DataLoader
Dataset définit comment récupérer un exemple. DataLoader organise les batches, le mélange et le parallélisme. Teste types, shapes et labels avant un entraînement long.

## Train vs eval
```python
model.train()
model.eval()
with torch.no_grad():
    predictions = model(inputs)
```

eval change notamment le comportement de dropout et batch normalization.

## Checkpoint
```python
torch.save({"model": model.state_dict(), "optimizer": optimizer.state_dict(), "epoch": epoch}, "checkpoint.pt")
```

Pour reprendre, conserve aussi configuration, métriques et état d'un scheduler/scaler s'ils existent.

## Exercice
Conçois un checkpoint permettant de reprendre l'entraînement après interruption.

:::indice
Observe shape, loss et gradients avant de modifier plusieurs paramètres à la fois.
:::

:::solution
Stocke model.state_dict(), optimizer.state_dict(), epoch/step, configuration et métriques.

:::

## À retenir
PyTorch fournit les primitives ; l'AI Engineer construit autour une structure testable, versionnée et reprenable.

## Introduction

PyTorch fournit les abstractions pour construire et entraîner des réseaux.

## Concept

Tensor, module, dataset et autograd forment les briques principales.

## Exemple

Un nn.Module encapsule paramètres et calcul ; DataLoader fournit les mini-batches.

## Comment ça fonctionne

dataset → DataLoader → model → loss → optimizer → checkpoint

## Questions d'entretien

- Pourquoi séparer train et eval ?

  :::indice
  Relie la question au comportement réel d'un entraînement.
  :::

  :::reponse
  Certains composants comme dropout et batch normalization ont un comportement différent en évaluation.
  :::
