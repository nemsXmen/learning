---
id: ai-07-rag-evaluation
title: "Évaluation RAG et groundedness"
slug: rag-eval
technology: ai-engineering
level: intermediate
module: 07-rag
order: 4
estimatedMinutes: 75
difficulty: 5
xp: 170
prerequisites: [ai-07-embeddings]
skills: [ai-rag]
tags: [rag, retrieval, llm]
---

## Objectifs
- construire un dataset RAG ;
- séparer retrieval et génération ;
- mesurer fidélité et couverture ;
- analyser les régressions.

## Dataset
Chaque cas contient question, passages pertinents et critères de réponse. Ajoute des cas ambigus, négatifs et hors périmètre.

## Retrieval metrics
Recall@k mesure si les passages pertinents apparaissent dans les k résultats. Precision@k mesure la proportion de résultats pertinents.

## Génération
Une réponse peut être fluide mais non supportée. Vérifie si les affirmations importantes sont entailées par le contexte récupéré.

## Groundedness
Évalue séparément retrieval, fidélité aux sources, couverture, citations, latence et coût.

```text
question -> retrieved context -> answer
          |                 |
       retrieval eval    groundedness eval
```

## Régression
Conserve un jeu fixe de tests et compare les versions de chunking, embeddings, reranker et prompt.

## Exercice
Après changement d'embedding, la satisfaction humaine monte mais recall@5 baisse. Que faire ?

### Solution
Examiner les cas gagnés et perdus. Ne pas conclure avec une seule métrique : identifier le compromis selon les objectifs produit.

## À retenir
Évaluer RAG signifie mesurer séparément récupération, réponse et contraintes opérationnelles.


## Introduction

Un système RAG doit être évalué séparément sur retrieval et génération.

## Concept

Recall, precision, groundedness et qualité finale mesurent des étapes différentes.

## Exemple

Un bon answer score avec un mauvais retrieval peut cacher des réponses mémorisées ou des cas faciles.

## Comment ça fonctionne

dataset → retrieve → evaluate context → generate → evaluate answer

## Questions d'entretien

- Pourquoi séparer retrieval et génération dans les tests ?

  :::indice
  Sépare toujours les erreurs de retrieval des erreurs de génération.
  :::

  :::reponse
  Pour localiser si une régression vient de la recherche ou du modèle génératif.
  :::
