---
id: ai-05-llm-architecture
title: "Architecture des LLM"
slug: llm-architecture
technology: ai-engineering
level: intermediate
module: transformers
order: 3
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-05-attention]
skills: [ai-transformers]
tags: [transformers, llm]
---

## Objectifs

Suivre le trajet d'un token dans un LLM, comprendre les blocs Transformer, les logits et la génération autoregressive.

## Pipeline
Un LLM autoregressif suit conceptuellement :

```text
texte
  -> tokenizer
  -> token IDs
  -> embeddings + information de position
  -> Transformer blocks
  -> logits
  -> sampling / argmax
  -> prochain token
```

Le processus est répété pour générer une séquence.

## Bloc Transformer
Un bloc moderne contient notamment attention, normalisation et réseau feed-forward, avec connexions résiduelles.

```text
x -> norm -> attention -> residual
  -> norm -> MLP      -> residual
```

Les détails exacts varient selon l'architecture.

## Logits et probabilités
Le modèle produit un score par token du vocabulaire. Un softmax transforme ces scores en distribution lorsque nécessaire.

La température modifie la concentration de cette distribution. Top-k et top-p imposent également des contraintes au sampling.

## Pré-entraînement
Un modèle causal apprend généralement à prédire le prochain token à partir des tokens précédents. L'objectif est appliqué sur de très grands corpus.

Cela ne signifie pas que le modèle possède une base de données fiable : ses poids encodent des régularités apprises et peuvent produire des sorties fausses.

## Génération
À chaque étape, le modèle estime le prochain token, puis ce token devient une nouvelle entrée du contexte.

La latence dépend notamment de la taille du modèle, de la longueur du contexte, du matériel et de la stratégie d'inférence.

## Exercices

- Pourquoi une température élevée peut-elle rendre une génération plus variée ?

:::indice
Regarde ce qu'elle fait à la concentration de la distribution avant le sampling.
:::

:::solution
Elle tend à aplatir la distribution, donnant davantage de chances aux tokens moins probables.
:::

## Erreurs fréquentes

Une température élevée ne donne pas au modèle de nouvelles connaissances. Elle modifie la distribution utilisée pour choisir les tokens. Il faut aussi distinguer pré-entraînement, où le modèle apprend des régularités, et inférence, où il les utilise pour produire une sortie.

## À retenir

Un LLM est un pipeline complet : tokenizer, représentations, blocs Transformer, logits et stratégie de génération.

## Introduction

Un LLM ne reçoit pas directement des mots et ne produit pas directement une phrase. Il transforme le texte en tokens, les représente numériquement, applique une succession de blocs et produit finalement des scores sur son vocabulaire.

## Concept

Le pipeline est : texte → tokenizer → token IDs → embeddings + positions → Transformer blocks → logits → sampling → prochain token. Le processus recommence avec le nouveau contexte.

## Exemple

Pour « Bonjour, comment », le modèle ne sélectionne pas directement une phrase complète. Il produit une distribution de scores pour les tokens possibles, puis une stratégie de génération choisit le prochain token.

## Comment ça fonctionne

Un bloc moderne combine attention, normalisation, réseau feed-forward et connexions résiduelles. Les logits sont des scores avant conversion en probabilités. Température, top-k et top-p modifient la manière dont on échantillonne ces scores. Le flow de génération se répète token après token.

## Questions d'entretien

Que produit directement la tête d'un LLM autoregressif ?

:::indice
Relie ta réponse au fonctionnement concret du modèle.
:::

:::reponse
Elle produit des logits sur le vocabulaire, qui servent ensuite à sélectionner le prochain token.
:::
