---
id: ai-07-retrieval
title: "Retrieval et recherche sémantique"
slug: retrieval
technology: ai-engineering
level: intermediate
module: 07-rag
order: 1
estimatedMinutes: 65
difficulty: 4
xp: 140
prerequisites: [ai-05-attention]
skills: [ai-rag]
tags: [rag, retrieval, llm]
---


## Objectifs
- distinguer recherche lexicale et sémantique ;
- comprendre embeddings et similarité ;
- choisir une stratégie de retrieval ;
- mesurer la qualité des résultats.

## Pourquoi le retrieval
Un LLM ne connaît pas automatiquement les données privées ou les changements récents. Le retrieval sélectionne des passages pertinents avant la génération.

## Recherche lexicale vs sémantique
BM25 exploite les termes présents. Les embeddings représentent le sens dans un espace vectoriel. Les deux approches sont complémentaires.

```text
query -> retrieval -> ranked chunks -> context
```

## Similarité
La similarité cosinus compare deux vecteurs normalisés par leur angle. Le score sert à classer, pas à prouver qu'un document est correct.

## Hybrid search
Une recherche hybride combine signaux lexicaux et vectoriels. Elle est utile quand les requêtes contiennent à la fois des concepts et des identifiants exacts.

## Evaluation
Mesure recall@k, precision@k et latence sur un jeu de requêtes annotées. N'optimise pas uniquement la qualité perçue de quelques exemples.

## Exercice
Une requête contient une référence de facture exacte mais aussi une description métier. Quelle recherche utiliser ?

### Solution
Une approche hybride peut exploiter l'identifiant exact via recherche lexicale et le sens via recherche sémantique.

## À retenir
Le retrieval est une étape de sélection mesurable, pas une simple fonction magique de base vectorielle.
