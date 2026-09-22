---
id: ai-05-tokenisation
title: "Tokenisation et embeddings"
slug: tokenisation
technology: ai-engineering
level: intermediate
module: transformers
order: 1
estimatedMinutes: 50
difficulty: 3
xp: 120
prerequisites: [ai-dl-pytorch]
skills: [ai-transformers]
tags: [transformers, llm]
---

## Objectifs

Comprendre pourquoi les LLM utilisent des tokens, distinguer IDs et embeddings et relier tokenisation au coût et à la fenêtre de contexte.

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

## Exercices
- Pourquoi un long texte peut-il être coûteux même s'il contient relativement peu de mots ?

:::indice
Pense à l'unité réellement consommée par le modèle.
:::
:::solution
Le coût et la fenêtre de contexte sont mesurés en tokens. Un texte peut donc produire beaucoup de sous-tokens.
:::
## Erreurs fréquentes

Compter les mots pour estimer le coût est une approximation fragile. Il faut mesurer les tokens réels. Il faut aussi tester les formats particuliers, les URLs, le code et les langues du produit.

## À retenir

Tokeniser est une étape d'ingénierie : mesure les tokens, la couverture linguistique et les limites de contexte avant de dimensionner l'application.

## Introduction

Avant qu'un Transformer traite du texte, celui-ci doit être transformé en unités numériques. Ces unités ne correspondent pas toujours à des mots complets : un mot peut devenir plusieurs sous-tokens.

## Concept

Le tokenizer transforme une chaîne en IDs. Les IDs sont des indices de vocabulaire ; ils ne représentent pas directement une signification. Une table d'embeddings transforme ensuite chaque ID en vecteur dense.

## Exemple

Pour un texte comme « internationalisation », le tokenizer peut choisir une ou plusieurs unités selon son vocabulaire. Le nombre obtenu influence directement la quantité de contexte envoyée au modèle.

## Comment ça fonctionne

Le flow est : texte → tokenizer → token IDs → embeddings → Transformer. Des méthodes comme BPE construisent des unités fréquentes afin de gérer un vocabulaire ouvert. Le nombre de tokens influence mémoire, latence et coût. En multilingue, mesure les langues réellement supportées car une même quantité de texte peut produire des nombres de tokens différents.

## Questions d'entretien
- Pourquoi le nombre de tokens compte-t-il ?

:::indice
Relie ta réponse au fonctionnement concret du modèle.
:::
:::reponse
Il influence la fenêtre de contexte, la latence, le coût et la quantité d'information traitée.
:::