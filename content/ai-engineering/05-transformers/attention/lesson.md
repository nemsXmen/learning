---
id: ai-05-attention
title: "Attention et multi-head attention"
slug: attention
technology: ai-engineering
level: intermediate
module: transformers
order: 2
estimatedMinutes: 65
difficulty: 4
xp: 140
prerequisites: [ai-05-tokenisation]
skills: [ai-transformers]
tags: [transformers, llm]
---

## Objectifs

Comprendre Q/K/V, le calcul des scores, le scaling, le masque causal et la multi-head attention.

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

## Exercices
- Dans une génération autoregressive, pourquoi la position 5 ne doit-elle pas voir le token réel de position 6 ?

:::indice
Relie la question à l'information disponible au moment où le token 5 doit être généré.
::

:::solution
Cela introduirait une information future et créerait une fuite de cible pendant l'entraînement.
::
## Erreurs fréquentes

Penser que l'attention « comprend » automatiquement le texte est trop vague. Il faut aussi surveiller le coût de l'attention dense, qui augmente fortement avec la longueur de séquence.

## À retenir

L'attention produit une combinaison pondérée des valeurs selon les compatibilités entre requêtes et clés.

## Introduction

Imagine qu'un token doit construire sa représentation en regardant les autres tokens. L'attention permet précisément de pondérer ces relations au lieu de traiter chaque position comme indépendante.

## Concept

Pour chaque représentation X, on calcule Q = XWq, K = XWk et V = XWv. Les scores proviennent de QKᵀ puis sont normalisés avant de combiner les valeurs. Chaque token obtient ainsi une représentation construite à partir des informations jugées pertinentes.

## Exemple

Dans « Le client paie la facture », le mot « paie » peut avoir besoin de relations différentes avec « client » et « facture ». L'attention donne au modèle un mécanisme pour apprendre ces relations plutôt qu'une règle fixe.

## Comment ça fonctionne

Le flow est : Q/K/V → scores → division par √dk → masque éventuel → softmax → combinaison pondérée des V. La division limite l'amplitude des scores lorsque la dimension augmente. Le masque causal interdit les positions futures. Plusieurs têtes permettent d'apprendre plusieurs projections relationnelles en parallèle.

## Questions d'entretien
- Pourquoi utiliser un masque causal ?

:::indice
Relie ta réponse au fonctionnement concret du modèle.
::

:::reponse
Il garantit qu'un modèle autoregressif ne peut pas utiliser des tokens futurs pour prédire le prochain token.
::