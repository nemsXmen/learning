---
id: ai-05-attention
title: "Attention et multi-head attention"
slug: attention
technology: ai-engineering
level: intermediate
module: 05-transformers
order: 2
estimatedMinutes: 65
difficulty: 4
xp: 140
prerequisites: [ai-05-tokenisation]
skills: [ai-transformers]
tags: [transformers, llm]
---

## Objectifs
- comprendre l'attention comme mécanisme de recherche pondérée ;
- calculer conceptuellement Q, K et V ;
- comprendre le rôle du masque ;
- distinguer self-attention et multi-head attention.

## Intuition
Pour chaque token, le modèle cherche quelles autres positions sont pertinentes pour construire sa représentation.

On projette les représentations en Query, Key et Value :

```text
Q = X Wq
K = X Wk
V = X Wv
scores = Q K^T / sqrt(dk)
attention = softmax(scores) V
```

Les scores indiquent la compatibilité entre une requête et les clés.

## Pourquoi diviser par sqrt(dk) ?
Lorsque la dimension augmente, les produits scalaires peuvent devenir grands. La mise à l'échelle aide à garder les logits dans une plage favorable au softmax.

## Masque causal
Dans un modèle autoregressif, un token ne doit pas voir les futurs tokens pendant la génération.

```text
position 1 : voit 1
position 2 : voit 1,2
position 3 : voit 1,2,3
```

Le masque transforme les positions interdites en scores qui ne contribuent pas au softmax.

## Multi-head attention
Plusieurs têtes apprennent des projections différentes. Elles peuvent capturer des relations différentes puis sont combinées.

## Limitation
L'attention dense compare potentiellement toutes les positions entre elles, ce qui rend son coût dépendant fortement de la longueur de séquence.

## Exercice
Dans une génération autoregressive, pourquoi la position 5 ne doit-elle pas utiliser directement le token réel de position 6 ?

### Solution
Cela introduirait une information future absente au moment réel de la génération et provoquerait une fuite de cible pendant l'entraînement.

## À retenir
L'attention n'est pas une simple moyenne : elle produit une combinaison pondérée des valeurs selon les compatibilités calculées entre requêtes et clés.

## Introduction

L'attention permet à un Transformer de pondérer dynamiquement les relations entre positions.

## Concept

Queries, keys et values produisent des scores normalisés ; le masque causal empêche de voir le futur.

## Exemple

Pour une génération autoregressive, la position courante ne doit pas accéder aux tokens suivants.

## Comment ça fonctionne

Q/K/V → scores → scaling → mask → softmax → weighted values

## Questions d'entretien

- Pourquoi utiliser un masque causal ?

  :::indice
  Pense au lien entre comportement du modèle et contraintes de production.
  :::

  :::reponse
  Pour conserver la contrainte autoregressive lors de l'entraînement et de la génération.
  :::
