---
id: ai-14-efficient
title: "Efficient AI : quantification, batching et distillation"
slug: efficient
technology: ai-engineering
level: advanced
module: 14-advanced
order: 2
estimatedMinutes: 80
difficulty: 5
xp: 180
prerequisites: [ai-14-finetuning]
skills: [ai-advanced]
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

## Exercice
Un modèle quantifié consomme deux fois moins de mémoire mais perd sur une métrique critique. Que faire ?

### Solution
Identifier les cas de régression, tester une quantification moins agressive ou un autre modèle avant de choisir.

## À retenir
L'efficacité est un compromis mesuré, pas une optimisation gratuite.
