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
skills: [ai-engineering]
tags: [ai, production, engineering]
---

## Objectifs
- comprendre CPU, GPU et VRAM ;
- identifier les principaux coûts mémoire ;
- raisonner sur batch et précision ;
- diagnostiquer les limites matérielles.

## Mémoire
Pour un modèle entraîné, la mémoire inclut poids, gradients, états de l'optimiseur et activations. L'inférence consomme surtout poids et activations intermédiaires.

```text
VRAM ~= weights + activations + runtime buffers + cache
```

## Précision
FP32, FP16 et BF16 offrent des compromis différents entre mémoire, vitesse et stabilité.

## Batch
Augmenter le batch peut améliorer le débit mais augmente généralement la mémoire nécessaire.

## Exercice
Une inférence échoue par OOM alors que le modèle tient presque en VRAM. Quels leviers tester ?

### Solution
Réduire batch/contexte, utiliser une précision adaptée, libérer les buffers inutiles et envisager quantification ou modèle plus petit.

## À retenir
La capacité d'un système IA dépend autant de la mémoire et du débit que du nombre de paramètres.
