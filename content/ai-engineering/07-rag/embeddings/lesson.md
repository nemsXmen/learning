---
id: ai-07-embeddings
title: "Embeddings et index vectoriels"
slug: embeddings
technology: ai-engineering
level: intermediate
module: 07-rag
order: 3
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-07-chunking]
skills: [ai-rag]
tags: [rag, retrieval, llm]
---

## Objectifs
- comprendre ce qu'est un embedding ;
- gérer dimensions et modèles d'embedding ;
- indexer et interroger des vecteurs ;
- éviter les incompatibilités de versions.

## Embedding
Un embedding transforme un texte en vecteur numérique. Des textes proches selon le modèle tendent à avoir des vecteurs proches.

```text
text -> embedding model -> vector -> vector index
query -> same embedding space -> nearest neighbors
```

## Dimension et distance
Tous les vecteurs d'un même index doivent respecter la dimension attendue. Le choix de distance doit correspondre à la façon dont le modèle produit ses représentations.

## Modèle
Changer de modèle d'embedding peut changer dimension, distribution et qualité. Une migration doit donc réindexer les documents et réévaluer le retrieval.

## Metadata filtering
Le vecteur ne remplace pas les filtres métier : tenant, ACL, langue, type de document et version peuvent être appliqués avant ou pendant la recherche selon le moteur.

## Exercice
Un index attend 768 dimensions mais le nouveau modèle produit 1536. Peut-on mélanger les deux ?

### Solution
Non dans un index homogène. Créer un nouvel index compatible et réindexer les contenus concernés.

## À retenir
Un embedding est un signal de recherche ; il ne garantit ni vérité ni autorisation.
