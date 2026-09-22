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
- Un score de similarité élevé ne prouve ni que le passage est vrai ni que l'utilisateur a le droit de le lire. Les ACL, tenant, langue et version restent des contraintes métier.

:::indice
- Une requête contient une référence de facture exacte et une description métier. Quelle stratégie utiliser ?
:::
:::solution
Cherche à exploiter à la fois les termes exacts et le sens de la requête.
:::
## Erreurs fréquentes

Le flow est : requête → génération des candidats → ranking → top-k → contexte. Le retrieval doit être mesuré indépendamment de la réponse finale avec recall@k, precision@k et latence.

## À retenir

Une recherche hybride permet de combiner le signal lexical pour la référence exacte et le signal sémantique pour la description.

## Introduction

Pourquoi le retrieval

## Concept

Un RAG commence par une question simple : quelles informations faut-il donner au modèle pour qu'il puisse répondre correctement ? Le retrieval répond à cette question en sélectionnant un petit ensemble de passages avant la génération.

## Exemple

La recherche lexicale regarde surtout les termes présents dans la requête. La recherche sémantique utilise des embeddings pour rapprocher des formulations dont le sens est similaire. Une stratégie hybride combine les deux signaux.

## Comment ça fonctionne

Prenons une question comme « quel est le plafond de remboursement de la carte GOLD ? ». Une recherche vectorielle peut retrouver le passage parlant de plafond, tandis que BM25 peut mieux exploiter un identifiant exact ou un terme rare.

## Questions d'entretien
- Le retrieval est une étape de sélection mesurable : sa qualité conditionne directement la qualité du contexte fourni au LLM.

:::indice
Relie ta réponse à la séparation entre retrieval et génération.
:::
:::reponse
Pourquoi mesurer recall@k ?
:::