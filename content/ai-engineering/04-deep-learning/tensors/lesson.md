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
prerequisites: [ai-maths]
skills: [ai-pytorch]
tags: [deep-learning, pytorch]
---

## Objectifs

À la fin de ce chapitre, tu dois pouvoir lire une shape de tenseur, choisir un dtype et un device adaptés, comprendre le broadcasting et expliquer comment PyTorch calcule automatiquement les gradients.

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

## Exercices
- Crée un tenseur de shape (32, 128), ajoute un biais de shape (128,) et vérifie la shape obtenue.

:::indice
Lis les dimensions comme une phrase : 32 exemples, chacun avec 128 features.
::

:::solution
Le résultat doit conserver la shape (32, 128), car le biais est appliqué à chaque exemple.
::
## Erreurs fréquentes

Une erreur classique consiste à corriger une shape sans comprendre ce que représente chaque dimension. Évite aussi les transferts CPU/GPU inutiles et ne confonds pas broadcasting et transformation métier.

## À retenir

Pour debugger PyTorch, commence par quatre questions : quelle est la shape, quel est le dtype, sur quel device se trouve le tenseur et quelles dérivées sont suivies ?

## Introduction

En deep learning, presque tout finit par devenir un tableau de nombres : une image, une séquence de tokens, un batch de transactions ou les activations d'un réseau. PyTorch représente ces données avec des tenseurs.

## Concept

Un tenseur possède notamment une shape, un dtype et un device. Un tenseur de shape (32, 128) représente naturellement 32 exemples ayant chacun 128 features. Une erreur de shape signifie souvent que les dimensions attendues par deux composants ne correspondent pas.

## Exemple

Supposons un batch de 32 exemples et un biais de 128 valeurs. Le broadcasting permet d'ajouter ce biais à chaque exemple. L'opération peut être valide mathématiquement sans être correcte selon ton intention métier.

## Comment ça fonctionne

Le device indique où le calcul est exécuté. Pour utiliser un GPU, les tenseurs et paramètres concernés doivent être sur le même device. L'autodifférentiation construit le graphe nécessaire aux gradients. Flow : paramètres → forward → loss → autograd → gradients → optimizer.

## Questions d'entretien
- Pourquoi contrôler le dtype et le device d'un tenseur ?

:::indice
Relie ta réponse au fonctionnement concret du système.
::

:::reponse
Un dtype inadapté peut provoquer des erreurs ou une perte de précision, tandis qu'un mauvais device peut empêcher une opération ou provoquer des transferts coûteux.
::