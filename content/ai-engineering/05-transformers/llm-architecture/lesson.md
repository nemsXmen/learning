---
id: ai-05-llm-architecture
title: "Architecture des LLM"
slug: llm-architecture
technology: ai-engineering
level: intermediate
module: 05-transformers
order: 3
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-05-attention]
skills: [ai-transformers]
tags: [transformers, llm]
---

## Objectifs
- comprendre les blocs fondamentaux d'un Transformer ;
- suivre le trajet d'un token jusqu'à la sortie ;
- distinguer pré-entraînement et génération ;
- comprendre causalité, positions et logits.

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

## Exercice
Pourquoi une température élevée peut-elle rendre une génération plus variée ?

### Solution
Elle a tendance à aplatir la distribution des logits avant le sampling, donnant davantage de chances aux tokens moins probables.

## À retenir
Un LLM n'est pas seulement un prompt et une réponse : tokenizer, contexte, architecture, logits et stratégie de génération font partie du système.