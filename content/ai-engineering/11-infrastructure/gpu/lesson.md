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
- Une quantification peut réduire la mémoire, mais elle doit être évaluée sur la qualité et le débit. Réduire le batch peut résoudre un OOM tout en diminuant le throughput.

:::indice
- Une inférence échoue par OOM alors que le modèle tient presque en VRAM. Quels leviers tester ?
::

:::solution
Commence par réduire ce qui varie avec la requête.
::
## Erreurs fréquentes

Le flow est : modèle → estimation mémoire → précision → batch/contexte → scheduling GPU → métriques. Compare toujours mémoire utilisée, throughput, p95/p99 et concurrence.

## À retenir

Réduire batch et contexte, choisir une précision adaptée, libérer les buffers inutiles, puis tester quantification ou modèle plus petit avec des mesures de qualité et performance.

## Introduction

Les contraintes matérielles avant l'optimisation

## Concept

Un workload AI est limité par plusieurs ressources : calcul, VRAM, bande passante mémoire, CPU et transferts. Comprendre ces contraintes permet de choisir une optimisation mesurable plutôt que de changer de matériel au hasard.

## Exemple

Pendant l'entraînement, la mémoire contient notamment poids, gradients, états de l'optimiseur et activations. En inférence, le besoin dépend surtout des poids, du contexte, des activations et des buffers du runtime.

## Comment ça fonctionne

Un modèle tient en FP16 mais provoque un OOM avec un contexte plus long. Le modèle n'a pas changé : les activations et buffers nécessaires à cette requête ont augmenté.

## Questions d'entretien
- La capacité d'un système AI dépend autant de la mémoire et du débit que du nombre de paramètres.

:::indice
Relie ta réponse à une métrique et à une contrainte système.
::

:::reponse
Pourquoi la VRAM est-elle critique ?
::