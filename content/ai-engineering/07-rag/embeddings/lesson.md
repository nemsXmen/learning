---
id: ai-07-embeddings
title: "Embeddings et index vectoriels"
slug: embeddings
technology: ai-engineering
level: intermediate
module: rag
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

## Exercices
- Changer de modèle peut modifier la dimension, la distribution des vecteurs et la qualité du retrieval. Une migration doit donc prévoir un nouvel index ou une stratégie compatible, une réindexation et une nouvelle évaluation.

:::indice
- Un index attend 768 dimensions mais le nouveau modèle produit 1536. Peut-on mélanger les deux ?
:::
:::solution
Vérifie d'abord le contrat de dimension de l'index.
:::
## Erreurs fréquentes

Le flow est : texte → modèle d'embedding → vecteur → index → nearest neighbors. L'indexation et la requête doivent utiliser un espace vectoriel compatible, avec une distance cohérente avec le modèle et sa normalisation.

## À retenir

Non dans un index homogène. Il faut créer un index compatible puis réindexer les contenus concernés et comparer les résultats.

## Introduction

Embeddings et espace vectoriel

## Concept

Un embedding transforme un texte en vecteur numérique. L'objectif n'est pas de stocker le texte différemment, mais de créer une représentation permettant de comparer des contenus dans un espace appris par le modèle.

## Exemple

Deux textes proches selon le modèle produisent généralement des vecteurs proches. Cette propriété permet une recherche sémantique, mais elle ne signifie pas que le vecteur contient une preuve ou une vérité.

## Comment ça fonctionne

Supposons qu'un index utilise un modèle produisant 768 dimensions. Si un nouveau modèle produit 1536 dimensions, ses vecteurs ne peuvent pas être mélangés directement avec ceux de l'ancien index homogène.

## Questions d'entretien
- Un embedding est un signal de recherche. Il ne remplace ni les règles d'accès, ni la validation métier, ni l'évaluation.

:::indice
Relie ta réponse à la séparation entre retrieval et génération.
:::
:::reponse
Pourquoi réévaluer après un changement de modèle d'embedding ?
:::