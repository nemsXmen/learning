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
- distinguer prompting, RAG et fine-tuning ;
- préparer un dataset d'adaptation ;
- comprendre overfitting et contamination ;
- évaluer un modèle adapté.

## Choix
Le prompting modifie l'instruction. Le RAG apporte des connaissances externes. Le fine-tuning modifie les paramètres du modèle pour apprendre un comportement ou une spécialisation.

```text
base model -> curated dataset -> adaptation -> evaluation -> deployment
```

## Dataset
Qualité, diversité, cohérence des labels et déduplication sont critiques. Évite les données confidentielles inutiles.

## Evaluation
Compare au modèle de base sur des cas métier et généraux. Surveille régression, hallucination et comportement hors distribution.

## Exercice
Un dataset contient 20 000 exemples presque identiques. Quel risque ?

:::indice
Compare la baseline et mesure explicitement le compromis avant d'adopter l'optimisation.
:::

:::solution
Surreprésentation, overfitting et faible diversité. Dédupliquer et enrichir les cas représentatifs.

:::

## Erreurs fréquentes

- choisir une technologie avant de définir le problème ;
- mesurer une moyenne sans regarder les cas critiques ;
- confondre une sortie plausible avec une sortie validée ;
- oublier coût, sécurité et opérations dans la conception.

## À retenir
Fine-tuner ne remplace ni une base de connaissances ni une validation rigoureuse.


## Introduction

Le fine-tuning adapte les paramètres d'un modèle à un comportement ou domaine ciblé.

## Concept

SFT, PEFT et LoRA réduisent différents coûts d'adaptation mais exigent un dataset de qualité.

## Exemple

Comparer modèle de base et modèle adapté sur cas métier et généraux révèle les régressions.

## Comment ça fonctionne

dataset → adaptation → validation → comparison → deployment

## Questions d'entretien

- Quand préférer RAG au fine-tuning ?

  :::indice
  Pense en compromis mesurables plutôt qu'en optimisation absolue.
  :::

  :::reponse
  Lorsque le besoin principal est d'apporter des connaissances externes, changeantes ou traçables.
  :::
