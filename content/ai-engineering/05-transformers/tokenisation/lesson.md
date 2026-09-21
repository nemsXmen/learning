---
id: ai-05-tokenisation
title: "Tokenisation et embeddings"
slug: tokenisation
technology: ai-engineering
level: intermediate
module: 05-transformers
order: 1
estimatedMinutes: 50
difficulty: 3
xp: 120
prerequisites: [ai-transformers]
skills: [ai-transformers]
tags: [transformers, llm]
---

## Objectifs
- comprendre pourquoi un LLM manipule des tokens plutôt que des mots ;
- distinguer vocabulaire, token IDs et embeddings ;
- comprendre BPE et les effets du tokenizer sur coût et contexte ;
- diagnostiquer les problèmes de tokenisation multilingue.

## Du texte aux IDs
Un tokenizer transforme une chaîne en séquence d'identifiants entiers.

```text
"Hello world" -> ["Hello", " world"] -> [15496, 995]
```

Les IDs ne portent pas directement un sens sémantique. Ils servent d'index dans le vocabulaire.

## Sous-mots
Les tokenizers modernes découpent souvent les mots en sous-unités. Cela permet de gérer vocabulaire ouvert, mots rares, fautes et morphologies différentes.

BPE construit progressivement des unités fréquentes. D'autres familles utilisent des variantes proches, par exemple WordPiece ou Unigram.

## Embeddings
Après tokenisation, chaque ID est associé à un vecteur dense appris.

```text
token id -> embedding vector -> transformer layers
```

Deux tokens proches dans un espace appris peuvent avoir des représentations similaires, mais l'embedding seul ne contient pas toute la signification contextuelle.

## Budget de contexte
Le nombre de tokens influence mémoire, latence et coût. Le nombre de mots n'est donc pas une bonne approximation universelle du coût d'un prompt.

Pour une application réelle, mesure les tokens du texte effectivement envoyé au modèle.

## Cas multilingue
Une même information peut nécessiter des nombres de tokens très différents selon la langue, le tokenizer et l'écriture. Pour un produit international, teste le tokenizer sur les langues réellement supportées.

## Exercice
Pourquoi un long texte peut-il être coûteux même s'il contient relativement peu de mots ?

### Solution
Parce que le coût et la fenêtre de contexte sont mesurés en tokens. Une langue ou un format mal représenté par le tokenizer peut produire beaucoup de sous-tokens.

## À retenir
Tokeniser est une étape d'ingénierie : mesure les tokens, la couverture linguistique et les limites de contexte avant de dimensionner une application.

## Introduction

La tokenisation transforme du texte en unités manipulables par un modèle de langage.

## Concept

Tokens, IDs, embeddings et contexte définissent le chemin du texte vers le modèle.

## Exemple

Le même texte peut consommer un nombre différent de tokens selon le tokenizer et la langue.

## Comment ça fonctionne

texte → tokenizer → token IDs → embeddings → modèle

## Questions d'entretien

- Pourquoi le nombre de tokens compte-t-il ?

  :::indice
  Pense au lien entre comportement du modèle et contraintes de production.
  :::

  :::reponse
  Il influence fenêtre de contexte, latence, coût et quantité d'information traitée.
  :::
