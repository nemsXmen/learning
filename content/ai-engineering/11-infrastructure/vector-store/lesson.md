---
id: ai-11-vector-store
title: "Vector stores et architecture de recherche"
slug: vector-store
technology: ai-engineering
level: advanced
module: infrastructure
order: 4
estimatedMinutes: 75
difficulty: 5
xp: 170
prerequisites: [ai-07-embeddings]
skills: [ai-infrastructure]
tags: [infrastructure, inference, ai]
---

## Objectifs
- choisir un stockage vectoriel ;
- comprendre index et filtres ;
- gérer multi-tenant et migrations ;
- mesurer les compromis opérationnels.

## Architecture
Un vector store conserve vecteurs et métadonnées et fournit une recherche par proximité.

```text
tenant + filters -> candidate vectors -> top-k -> reranker
```

## Index
Les index ANN accélèrent la recherche approximative avec des compromis entre recall, mémoire et latence.

## Multi-tenant
Les filtres d'autorisation doivent être intégrés au retrieval et testés comme une propriété de sécurité.

## Migration
Changer dimension ou modèle d'embedding implique souvent un nouvel index et une réindexation contrôlée.

## Exercice
Un index partagé retourne un chunk d'un autre tenant. Quel principe a échoué ?

### Solution
L'isolation d'autorisation au retrieval. Le filtre tenant doit être imposé côté serveur.

## À retenir
Un vector store est une infrastructure de données avec contraintes de sécurité et performance.


## Introduction

Un vector store permet de rechercher efficacement dans des embeddings.

## Concept

ANN, index, filtres metadata et migrations déterminent les performances et la sécurité.

## Exemple

Un index multi-tenant doit appliquer le filtre d'accès au même moment que la recherche.

## Comment ça fonctionne

query vector → ANN → metadata filter → ranked results

## Questions d'entretien

- Pourquoi les migrations d'embeddings sont-elles coûteuses ?

  :::indice
  Relie performance et fiabilité au comportement sous charge.
  :::

  :::reponse
  Changer de modèle peut imposer de recalculer et réindexer tout le corpus.
  :::
