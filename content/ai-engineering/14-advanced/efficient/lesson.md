---
id: ai-14-efficient
title: "Efficient AI : quantification, batching et distillation"
slug: efficient
technology: ai-engineering
level: advanced
module: advanced
order: 2
estimatedMinutes: 80
difficulty: 5
xp: 180
prerequisites: [ai-14-finetuning]
skills: [ai-infrastructure]
tags: [fine-tuning, inference, multimodal, optimization]
---

## Objectifs
- réduire mémoire et coût ;
- comprendre quantification ;
- optimiser batch et cache ;
- mesurer les compromis.

## Quantification
Réduire la précision des poids peut diminuer mémoire et accélérer l'inférence, avec un possible impact qualité.

```text
quality <-> memory <-> latency <-> cost
```

## Batching
Le batching améliore souvent le throughput mais augmente potentiellement la latence individuelle.

## Distillation
Un modèle plus petit peut apprendre des sorties d'un modèle enseignant. Évalue les pertes de capacités avant adoption.

## Exercices
Un modèle quantifié consomme deux fois moins de mémoire mais perd sur une métrique critique. Que faire ?

:::indice
Compare la baseline et mesure explicitement le compromis avant d'adopter l'optimisation.
:::

:::solution
Identifier les cas de régression, tester une quantification moins agressive ou un autre modèle avant de choisir.

:::

## Erreurs fréquentes

- choisir une technologie avant de définir le problème ;
- mesurer une moyenne sans regarder les cas critiques ;
- confondre une sortie plausible avec une sortie validée ;
- oublier coût, sécurité et opérations dans la conception.

## À retenir
L'efficacité est un compromis mesuré, pas une optimisation gratuite.


## Introduction

L'efficacité AI cherche à réduire mémoire, latence et coût sans dépasser les contraintes qualité.

## Concept

Quantification, batching, distillation et caching ont des compromis distincts.

## Exemple

Une quantification plus agressive peut réduire la mémoire mais dégrader une métrique critique.

## Comment ça fonctionne

baseline → optimization → benchmark → tradeoff

## Questions d'entretien

- Pourquoi benchmarker après quantification ?

  :::indice
  Pense en compromis mesurables plutôt qu'en optimisation absolue.
  :::

  :::reponse
  Parce que gain mémoire ou débit ne garantit pas une qualité suffisante.
  :::
