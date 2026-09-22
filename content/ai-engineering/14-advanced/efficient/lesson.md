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
- comprendre les principaux leviers d'efficacité ;
- mesurer l'effet de la quantification ;
- distinguer throughput et latence individuelle ;
- utiliser batching, cache et distillation avec méthode ;
- choisir une optimisation à partir de mesures.

## Introduction

Une application IA peut être limitée par la VRAM, le temps de réponse, le coût par requête ou la capacité du système à absorber la concurrence. « Plus rapide » n'est donc pas une métrique suffisante.

L'ingénieur commence par une baseline, définit les contraintes, applique une optimisation et mesure son impact.

## Concept

Les principaux leviers peuvent être vus ainsi :

~~~
                    ┌─ quantification → moins de mémoire
modèle / système ───┼─ batching       → plus de throughput
                    ├─ cache          → moins de calcul répété
                    └─ distillation  → modèle plus petit
~~~

Chaque levier peut améliorer une dimension et en dégrader une autre.

La quantification réduit la précision numérique des poids, par exemple de formats plus précis vers des formats plus compacts. Le gain dépend du modèle et du matériel ; il faut donc benchmarker au lieu de supposer un résultat.

## Exemple

Une API reçoit 100 requêtes simultanées. Le modèle consomme presque toute la VRAM et le coût est trop élevé.

On teste une quantification :

~~~
baseline:
VRAM élevée → qualité 92 → p95 1.8 s

quantifié:
VRAM réduite → qualité 90 → p95 1.5 s
~~~

Si la métrique critique accepte cette variation, l'optimisation peut être pertinente. Si elle chute sur les cas réglementaires ou de sécurité, la moyenne ne suffit pas pour décider.

## Comment ça fonctionne

Le batching regroupe plusieurs requêtes pour exploiter efficacement le GPU. Il augmente souvent le throughput, mais ajoute potentiellement du temps d'attente au scheduler.

Le cache est efficace lorsque les entrées ou préfixes se répètent. Il doit tenir compte de l'identité du modèle, de la version du prompt, du tenant et des permissions lorsque ces dimensions influencent le résultat.

La distillation entraîne un modèle plus petit à partir des comportements d'un modèle enseignant. Elle peut réduire coût et latence, mais certaines capacités peuvent disparaître.

Mesure au minimum :
- qualité par segment ;
- p50/p95/p99 ;
- tokens/seconde et throughput ;
- mémoire/VRAM ;
- coût par requête ;
- taux d'erreur.

## Erreurs fréquentes

- optimiser sans baseline ;
- confondre throughput et latence ;
- choisir une quantification uniquement parce qu'elle économise de la VRAM ;
- mettre en cache une réponse sans vérifier son contexte et ses permissions ;
- mesurer uniquement une moyenne ;
- oublier les cas critiques après distillation.

## Exercices
- Un modèle quantifié consomme deux fois moins de mémoire mais perd sur une métrique critique. Quelle démarche suivre ?

:::indice
Ne compare pas seulement la consommation mémoire. Segmente les régressions et vérifie si une optimisation moins agressive existe.
::

:::solution
Identifier les cas qui régressent, comparer plusieurs niveaux de quantification ou un autre modèle, puis mesurer qualité, latence, mémoire et coût sur le même benchmark. Conserver l'optimisation uniquement si les contraintes métier restent respectées.
::
## À retenir

L'efficacité IA est un problème multi-objectifs : qualité, mémoire, latence, throughput et coût doivent être mesurés ensemble.

## Questions d'entretien
- Pourquoi le batching peut-il améliorer le throughput tout en dégradant la latence ?
  - Quand un cache de réponse est-il dangereux ?
  - Quel est l'intérêt de la distillation ?
  - Pourquoi benchmarker chaque changement d'optimisation ?

:::indice
Explique toujours la métrique gagnée, la métrique potentiellement perdue et le protocole de comparaison.
::

:::reponse
Le batching amortit les coûts GPU mais peut faire attendre une requête. Un cache mal dimensionné peut retourner une réponse d'un mauvais contexte ou tenant. La distillation cherche à transférer des capacités vers un modèle plus petit. Chaque optimisation doit être benchmarkée car son effet dépend du modèle, des données, du matériel et de la charge.
::