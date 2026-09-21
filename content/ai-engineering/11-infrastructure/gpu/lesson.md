---
id: ai-11-gpu
title: "GPU, mémoire et calcul IA"
slug: gpu
technology: ai-engineering
level: advanced
module: 11-infrastructure
order: 1
estimatedMinutes: 75
difficulty: 4
xp: 160
prerequisites: [ai-04-pytorch]
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

## Exercice
Une inférence échoue par OOM alors que le modèle tient presque en VRAM. Quels leviers tester ?

### Solution
Réduire batch/contexte, utiliser une précision adaptée, libérer les buffers et envisager quantification ou modèle plus petit.

## À retenir
La capacité IA dépend autant de mémoire et débit que du nombre de paramètres.
