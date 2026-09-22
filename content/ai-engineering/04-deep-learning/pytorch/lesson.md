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

À la fin de ce chapitre, tu dois pouvoir structurer un nn.Module, construire un pipeline Dataset/DataLoader, gérer les modes train/eval et sauvegarder un checkpoint exploitable.

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

## Exercices
- Conçois le contenu minimal d'un checkpoint permettant de reprendre un entraînement après interruption.

:::indice
Distingue les paramètres appris de l'état de l'expérience.
::

:::solution
Conserve model.state_dict(), optimizer.state_dict(), epoch ou step, puis configuration et, si nécessaire, scheduler/scaler et métriques.
::
## Erreurs fréquentes

Sauvegarder uniquement les poids peut être insuffisant pour reprendre exactement un entraînement. Évite aussi de mélanger le preprocessing de train et celui de validation.

## À retenir

Un pipeline PyTorch robuste doit être testable avant entraînement, explicite sur ses modes train/eval et capable de reprendre depuis un état versionné.

## Introduction

Un modèle qui fonctionne dans un notebook n'est pas encore un composant fiable. Il faut séparer les responsabilités, tester les données, reproduire une expérience et reprendre un entraînement interrompu.

## Concept

Un nn.Module encapsule les paramètres et le calcul. Dataset décrit comment récupérer un exemple tandis que DataLoader organise les exemples en batches.

## Exemple

Avant un long entraînement, teste le pipeline sur quelques exemples. Flow : source de données → Dataset → DataLoader → batch → model → loss. Cela révèle rapidement une mauvaise shape, un dtype incorrect ou un label invalide.

## Comment ça fonctionne

train et eval ne sont pas interchangeables. Dropout et batch normalization changent notamment de comportement. Pour reprendre une expérience, conserve les poids, l'état de l'optimiseur, l'epoch ou le step et, selon le pipeline, scheduler, scaler, configuration et métriques.

## Questions d'entretien
- Pourquoi séparer model.train() et model.eval() ?

:::indice
Relie ta réponse au fonctionnement concret du système.
::

:::reponse
Dropout et batch normalization se comportent différemment pendant l'entraînement et l'évaluation. Le mauvais mode peut donc fausser les résultats.
::