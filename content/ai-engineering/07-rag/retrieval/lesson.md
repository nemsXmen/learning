---
id: ai-07-retrieval
title: "Retrieval et recherche sémantique"
slug: retrieval
technology: ai-engineering
level: intermediate
module: rag
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
La similarité cosinus compare deux vecteurs par leur angle. Le score sert à classer, pas à prouver qu'un document est correct.

## Hybrid search
Une recherche hybride combine signaux lexicaux et vectoriels, notamment pour des requêtes mêlant concepts et identifiants exacts.

## Evaluation
Mesure recall@k, precision@k et latence sur un jeu de requêtes annotées.

## Exercices
Une requête contient une référence de facture exacte et une description métier. Quelle stratégie utiliser ?

:::indice
Sépare retrieval, contexte et génération pour localiser l'erreur.
:::

:::solution
Une recherche hybride peut exploiter l'identifiant exact et le sens de la description.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
Le retrieval est une étape de sélection mesurable, pas une fonction magique de base vectorielle.


## Introduction

Le retrieval sélectionne le contexte utile avant génération.

## Concept

Recherche lexicale, vectorielle et hybride répondent à des signaux différents.

## Exemple

BM25 retrouve bien des termes exacts tandis que les embeddings rapprochent des formulations sémantiquement similaires.

## Comment ça fonctionne

query → candidates → ranking → top-k → context

## Questions d'entretien

- Pourquoi mesurer recall@k ?

  :::indice
  Sépare toujours les erreurs de retrieval des erreurs de génération.
  :::

  :::reponse
  Pour savoir si les documents pertinents sont effectivement récupérés dans les k premiers résultats.
  :::
