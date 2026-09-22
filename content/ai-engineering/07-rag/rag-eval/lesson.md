---
id: ai-07-rag-evaluation
title: "Évaluation RAG et groundedness"
slug: rag-eval
technology: ai-engineering
level: intermediate
module: rag
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

## Exercices
- Une réponse finale peut rester bonne alors que le retrieval régresse, par exemple parce que le modèle connaît déjà le sujet. À l'inverse, un excellent retrieval ne garantit pas une réponse fidèle. Il faut donc conserver les deux niveaux de mesure.

:::indice
- Après un changement d'embedding, la satisfaction humaine monte mais recall@5 baisse. Que faire ?
:::
:::solution
Cherche les cas gagnés et perdus au lieu de regarder une seule moyenne.
:::
## Erreurs fréquentes

Le flow est : dataset → retrieve → évaluation du contexte → génération → évaluation de la réponse. Conserve aussi latence, coût, citations et taux d'erreur. Une suite fixe permet de comparer chunking, embeddings, reranking et prompts.

## À retenir

Analyser les segments concernés et le compromis entre retrieval et résultat final. Une seule métrique ne suffit pas : la décision dépend des objectifs du produit et des contraintes opérationnelles.

## Introduction

Évaluer un RAG sans confondre ses étapes

## Concept

Un RAG peut produire une réponse convaincante pour de mauvaises raisons. Pour comprendre réellement le système, il faut tester séparément la qualité de la récupération et celle de la génération.

## Exemple

Construis un dataset avec question, passages pertinents attendus et critères de réponse. Ajoute des questions ambiguës, des cas négatifs, des documents similaires et des requêtes hors périmètre.

## Comment ça fonctionne

Pour une requête, on peut d'abord mesurer si les bons passages apparaissent dans le top-k. Ensuite seulement, on mesure si la réponse utilise correctement ce contexte et si ses affirmations importantes sont supportées.

## Questions d'entretien
- Évaluer un RAG signifie mesurer récupération, fidélité de génération et contraintes opérationnelles séparément.

:::indice
Relie ta réponse à la séparation entre retrieval et génération.
:::
:::reponse
Pourquoi séparer retrieval et génération dans les tests ?
:::