---
id: ai-dl-tensors
title: "Tenseurs et calcul différentiable"
slug: tensors
technology: ai-engineering
level: beginner
module: deep-learning
order: 1
estimatedMinutes: 60
difficulty: 3
xp: 130
prerequisites: [ai-linear-algebra]
skills: [ai-pytorch]
tags: [deep-learning, pytorch]
---

## Objectifs
- comprendre tenseur, shape, dtype et device ;
- manipuler les dimensions ;
- comprendre l'autodifférentiation.

## Tenseur
Un tenseur généralise vecteurs et matrices. Dans PyTorch, il possède notamment une shape, un dtype et un device.

```python
import torch
x = torch.tensor([[1., 2., 3.], [4., 5., 6.]])
print(x.shape)
print(x.dtype)
```

## Broadcasting
Certaines dimensions compatibles sont étendues implicitement. Une opération valide peut néanmoins être sémantiquement incorrecte : vérifie toujours les shapes.

```python
x = torch.ones(4, 3)
bias = torch.zeros(3)
y = x + bias
```

## Device
```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
x = x.to(device)
```

## Autodiff
```python
w = torch.tensor(2.0, requires_grad=True)
loss = (w - 5) ** 2
loss.backward()
print(w.grad)
```

## Exercice
Crée un tenseur (32, 128), ajoute un biais (128,), puis vérifie la shape.

### Solution
```python
x = torch.randn(32, 128)
bias = torch.zeros(128)
y = x + bias
assert y.shape == (32, 128)
```

## À retenir
Shape, dtype, device et gradients sont quatre notions essentielles au debugging d'un réseau neuronal.

## Introduction

Les tenseurs sont la structure numérique fondamentale des calculs PyTorch.

## Concept

Shape, dtype, device et broadcasting déterminent la compatibilité et le coût des opérations.

## Exemple

Une erreur de shape sur une couche linéaire peut être détectée avant l'entraînement avec un petit batch de test.

## Comment ça fonctionne

entrée → tenseurs → opérations → autograd → sortie

## Questions d'entretien

- Pourquoi contrôler dtype et device ?

  :::indice
  Relie la question au comportement réel d'un entraînement.
  :::

  :::reponse
  Un mauvais dtype ou un déplacement CPU/GPU inutile peut provoquer erreur ou dégradation de performance.
  :::
