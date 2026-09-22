---
id: ai-14-finetuning
title: "Fine-tuning, instruction tuning et adaptation"
slug: finetuning
technology: ai-engineering
level: advanced
module: advanced
order: 1
estimatedMinutes: 85
difficulty: 5
xp: 190
prerequisites: [ai-05-llm-architecture]
skills: [ai-finetuning]
tags: [fine-tuning, inference, multimodal, optimization]
---

## Objectifs
- distinguer prompting, RAG, fine-tuning et adaptation légère ;
- préparer un dataset d'entraînement exploitable ;
- comprendre SFT, PEFT et LoRA ;
- détecter overfitting, contamination et régression ;
- construire une évaluation avant de déployer.

## Introduction

Un modèle de base sait déjà produire du texte, mais il ne connaît pas nécessairement le comportement métier attendu. Le fine-tuning consiste à modifier ses paramètres à partir d'exemples afin de renforcer un comportement, un format ou une spécialisation.

La première question n'est pourtant pas « comment fine-tuner ? », mais « quelle partie du problème doit réellement changer ? ».

## Concept

Trois stratégies répondent à des besoins différents :

~~~
besoin
  ├── instruction/comportement simple ──> prompting
  ├── connaissance externe/changeante ─> RAG
  └── comportement spécialisé durable ─> fine-tuning
~~~

Le SFT (Supervised Fine-Tuning) apprend à reproduire des exemples d'entrée/sortie. Le PEFT (Parameter-Efficient Fine-Tuning) limite les paramètres réellement entraînés. LoRA ajoute de petites matrices entraînables plutôt que de modifier tous les poids.

Le fine-tuning n'est donc pas une base documentaire. Une connaissance qui change souvent reste généralement plus adaptée à une couche de retrieval.

## Exemple

Supposons un assistant qui doit transformer des demandes clients en JSON strict.

Un premier essai peut utiliser prompting + structured output. Si le comportement reste instable sur plusieurs milliers de requêtes représentatives, un dataset d'exemples validés peut servir à une adaptation.

~~~
base model
    ↓
dataset nettoyé
    ↓
train / validation
    ↓
SFT ou PEFT
    ↓
évaluation métier + générale
    ↓
comparaison avec baseline
    ↓
déploiement
~~~

La comparaison avec le modèle de base est essentielle : une amélioration sur le format peut cacher une régression sur le raisonnement ou les refus.

## Comment ça fonctionne

Un dataset utile doit être représentatif, dédupliqué et versionné. Sépare les données d'entraînement des données d'évaluation avant l'entraînement.

Surveille notamment :
- qualité et cohérence des labels ;
- distribution des cas ;
- données sensibles ou inutiles ;
- doublons entre train et validation ;
- contamination du jeu de test ;
- taille et diversité des exemples.

Pendant l'adaptation, suis la perte d'entraînement mais ne l'utilise pas seule comme indicateur de qualité. Une perte qui baisse alors que les performances hors échantillon stagnent peut signaler un surapprentissage.

## Erreurs fréquentes

- fine-tuner alors qu'un RAG suffit ;
- mélanger train et test ;
- entraîner sur des exemples quasi identiques ;
- conserver des données confidentielles sans nécessité ;
- mesurer uniquement la moyenne et ignorer les cas critiques ;
- oublier de comparer au modèle de base ;
- considérer une amélioration de benchmark comme une preuve de qualité production.

## Exercices
- Un dataset contient 20 000 exemples presque identiques. Comment diagnostiquer le problème et que changerais-tu avant l'entraînement ?

:::indice
Regarde la diversité, la couverture des cas rares et la séparation entre données d'entraînement et d'évaluation.
:::
:::solution
Mesurer les doublons et quasi-doublons, analyser la distribution des cas et vérifier la contamination du jeu de test. Dédupliquer puis enrichir le dataset avec des exemples représentatifs, notamment des cas limites. Refaire ensuite l'évaluation contre une baseline stable.
:::
## À retenir

Le fine-tuning est une optimisation de comportement. Il commence par un dataset de qualité et se termine par une comparaison rigoureuse avec une baseline, pas par la seule fin de l'entraînement.

## Questions d'entretien
- Quand préférer RAG au fine-tuning ?
  - Pourquoi séparer strictement train, validation et test ?
  - Qu'apportent PEFT et LoRA ?
  - Comment détecter une régression après adaptation ?

:::indice
Pour chaque réponse, raisonne en termes de besoin, données, métriques et compromis.
:::
:::reponse
RAG est adapté lorsqu'il faut injecter des connaissances externes, changeantes ou traçables. Train/validation/test permettent de mesurer la généralisation. PEFT/LoRA réduisent les paramètres et ressources à entraîner. Une régression se détecte en comparant le modèle adapté au modèle de base sur un jeu représentatif et segmenté.
:::