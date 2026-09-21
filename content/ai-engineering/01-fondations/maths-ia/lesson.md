---
id: ai-maths-fondations
title: "Mathématiques pour l'IA : vecteurs, matrices, probabilités et statistiques"
slug: maths-ia
technology: ai-engineering
level: beginner
module: fondations
order: 4
estimatedMinutes: 60
difficulty: 3
xp: 120
prerequisites: []
skills:
  - ai-linear-algebra
  - ai-probability
tags: [mathematics, linear-algebra, probability, statistics]
---

## Objectifs

- comprendre vecteurs, matrices, produit scalaire et norme ;
- calculer une similarité cosinus ;
- utiliser probabilité conditionnelle et Bayes ;
- lire moyenne, variance et quantiles ;
- relier ces notions aux embeddings et à l'évaluation.

## Vecteurs

Un vecteur est une liste ordonnée de nombres.

```python
import numpy as np

a = np.array([1.0, 2.0, 3.0])
b = np.array([2.0, 0.0, 1.0])

dot = a @ b
norm = np.linalg.norm(a)
```

Le produit scalaire est la somme des produits composante par composante.

## Similarité cosinus

La formule est :

cos(a,b) = (a·b) / (||a|| ||b||).

Elle mesure l'angle entre deux vecteurs. Elle est couramment utilisée pour comparer des embeddings, mais la métrique doit rester cohérente avec le modèle et l'index.

## Matrices

```python
X = np.array([[1, 2], [3, 4], [5, 6]])
W = np.array([[0.2, 0.4], [0.1, 0.3]])
Y = X @ W
```

Les dimensions doivent être compatibles. Les réseaux neuronaux effectuent une grande quantité d'opérations de ce type.

## Probabilité conditionnelle

La probabilité conditionnelle est P(A|B) = P(A∩B) / P(B).

Bayes :

P(A|B) = P(B|A)P(A) / P(B).

Une sortie appelée probabilité par un modèle n'est pas automatiquement parfaitement calibrée.

## Statistiques

La moyenne résume le centre d'une distribution ; variance et quantiles décrivent sa dispersion.

Pour une API AI, mesurer p50, p95 et p99 est plus informatif que la seule moyenne : une longue traîne peut être invisible dans une moyenne.

## Train, validation et test

- train : apprendre ;
- validation : choisir et régler ;
- test : estimation finale ;
- production : distribution réelle.

Une fuite de données entre ces ensembles peut produire une métrique artificiellement optimiste.

## Lien avec l'IA

- vecteurs → embeddings ;
- matrices → couches neuronales ;
- produit scalaire → attention et similarité ;
- probabilités → classification et génération ;
- statistiques → métriques et analyse d'incertitude ;
- quantiles → SLO de latence.

## Exercice

Calcule la similarité cosinus de a=[1,0] et b=[0.8,0.6].

### Solution

Le produit scalaire vaut 0.8 et les deux normes valent 1. La similarité vaut donc 0.8.

```python
import numpy as np
a = np.array([1.0, 0.0])
b = np.array([0.8, 0.6])
similarity = (a @ b) / (np.linalg.norm(a) * np.linalg.norm(b))
print(similarity)
```

## À retenir

Les vecteurs, matrices, probabilités et statistiques sont le langage quantitatif qui permet de comprendre embeddings, réseaux neuronaux, métriques et performances AI.


## Introduction

Les mathématiques donnent à l'AI Engineer les modèles mentaux nécessaires pour comprendre données, optimisation et métriques.

## Concept

Vecteurs, matrices, probabilités et statistiques permettent de raisonner sur représentations, incertitude et performance.

## Exemple

Exemple : le produit scalaire compare deux vecteurs et intervient directement dans de nombreux mécanismes d'embeddings.

## Comment ça fonctionne

Un pipeline ML transforme des données en représentations puis optimise une fonction objectif sous des hypothèses statistiques.

## Questions d'entretien

- Pourquoi les probabilités sont-elles importantes en IA ?

  :::indice
  Relie le concept à un problème concret de production AI.
  :::

  :::reponse
  Réponse : elles permettent de quantifier incertitude, distributions, erreurs d'échantillonnage et décisions sous risque.
  :::
