---
id: ai-11-vector-store
title: "Vector stores et architecture de recherche"
slug: vector-store
technology: ai-engineering
level: advanced
module: 11-infrastructure
order: 4
estimatedMinutes: 75
difficulty: 5
xp: 170
prerequisites: [ai-07-embeddings]
skills: [ai-engineering]
tags: [ai, production, engineering]
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
Les index ANN accélèrent la recherche approximative au prix de compromis entre recall, mémoire et latence.

## Multi-tenant
Les filtres d'autorisation doivent être intégrés à la requête de retrieval et testés comme une propriété de sécurité.

## Migration
Changer dimension ou modèle d'embedding implique souvent un nouvel index et une réindexation contrôlée.

## Exercice
Un index partagé retourne un chunk d'un autre tenant. Quel principe a échoué ?

### Solution
L'isolation d'autorisation au retrieval. Le filtre tenant doit être imposé côté serveur et couvert par des tests.

## À retenir
Un vector store est une infrastructure de données avec des contraintes de sécurité, cohérence et performance.
