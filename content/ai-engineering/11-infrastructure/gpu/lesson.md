---
id: ai-11-gpu
title: "GPU, mémoire et calcul IA"
slug: gpu
technology: ai-engineering
level: advanced
module: infrastructure
order: 1
estimatedMinutes: 75
difficulty: 4
xp: 160
prerequisites: [ai-dl-pytorch]
skills: [ai-infrastructure]
tags: [infrastructure, inference, ai]
---

## Objectifs
- comprendre CPU, GPU et VRAM ;
- identifier les coûts mémoire ;
- raisonner sur batch et précision ;
- diagnostiquer les limites matérielles.

## Mémoire
La mémoire d'un entraînement inclut poids, gradients, états de l'optimiseur et activations. L'inférence consomme surtout poids et activations intermédiaires.

```text
VRAM ~= weights + activations + runtime buffers + cache
```

## Précision
FP32, FP16 et BF16 offrent des compromis entre mémoire, vitesse et stabilité.

## Exercices
Une inférence échoue par OOM alors que le modèle tient presque en VRAM. Quels leviers tester ?

:::indice
Mesure mémoire, débit, latence et concurrence avant de conclure à une optimisation.
:::

:::solution
Réduire batch/contexte, utiliser une précision adaptée, libérer les buffers et envisager quantification ou modèle plus petit.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
La capacité IA dépend autant de mémoire et débit que du nombre de paramètres.


## Introduction

Les workloads AI sont souvent limités par mémoire, calcul et transfert de données.

## Concept

VRAM, précision numérique, batch et taille de modèle déterminent la capacité d'un GPU.

## Exemple

Un modèle qui tient en FP16 peut nécessiter une stratégie différente en quantification lorsqu'il dépasse la VRAM.

## Comment ça fonctionne

model → memory estimate → precision → GPU scheduling

## Questions d'entretien

- Pourquoi la VRAM est-elle critique ?

  :::indice
  Relie performance et fiabilité au comportement sous charge.
  :::

  :::reponse
  Elle limite les modèles, contextes et batches pouvant être chargés simultanément.
  :::
