---
id: ai-07-rag-chunking
title: "Ingestion, chunking & metadata"
slug: chunking
technology: ai-engineering
level: intermediate
module: 07-rag
order: 1
estimatedMinutes: 45
difficulty: 3
xp: 120
prerequisites: []
skills:
  - ai-rag
tags: [ai, rag, agents]
---

## Objectifs
- Comprendre Ingestion, chunking & metadata.
- Construire une étape isolée et mesurable.
- Diagnostiquer les erreurs de récupération ou d'orchestration.

## Concept
Un système RAG sépare ingestion, représentation, indexation, récupération, génération et évaluation. Cette séparation est essentielle : une mauvaise réponse peut venir d'un document absent, d'un mauvais découpage, d'une recherche trop large ou du modèle de génération.

Pour **Ingestion, chunking & metadata**, définis des contrats entre chaque étape. Conserve les métadonnées utiles, limite les résultats récupérés et mesure séparément la qualité de récupération et la qualité de réponse.

## Méthode
1. Préparer des données propres.
2. Produire une représentation stable.
3. Indexer avec les métadonnées nécessaires.
4. Récupérer un petit ensemble de candidats.
5. Filtrer ou reranker si nécessaire.
6. Générer une réponse ancrée dans les éléments récupérés.
7. Évaluer récupération et réponse séparément.

## Erreurs fréquentes
- Utiliser des chunks arbitraires sans mesurer leur effet.
- Perdre les métadonnées lors de l'ingestion.
- Envoyer trop de documents au modèle.
- Ne pas distinguer échec de retrieval et hallucination.
- Pour un agent, laisser une boucle ou un outil sans limite.

## Exercice
Crée un jeu de dix questions avec leurs sources attendues. Mesure quels éléments sont récupérés et si la réponse finale reste ancrée dans ces sources.

:::indice
Quand une réponse est fausse, demande d'abord : « les bonnes informations étaient-elles disponibles dans le contexte ? »
:::

:::solution
Sépare recall de retrieval et qualité de génération. Journalise les documents récupérés, leurs scores et les raisons d'un échec afin de pouvoir corriger la bonne étape.
:::

## À retenir
- RAG est une chaîne de composants, pas un simple prompt.
- Les métadonnées et l'évaluation rendent le retrieval exploitable.
- Les agents doivent être bornés par des états, outils et règles explicites.
