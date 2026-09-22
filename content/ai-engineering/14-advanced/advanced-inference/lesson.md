---
id: ai-14-advanced-inference
title: "Inference avancée et systèmes à haute performance"
slug: advanced-inference
technology: ai-engineering
level: advanced
module: advanced
order: 4
estimatedMinutes: 90
difficulty: 5
xp: 200
prerequisites: [ai-14-multimodal]
skills: [ai-infrastructure]
tags: [fine-tuning, inference, multimodal, optimization]
---

## Objectifs
- raisonner sur throughput et tail latency ;
- comprendre le rôle du scheduler et du batching dynamique ;
- expliquer le KV cache ;
- choisir une stratégie de cache et de parallélisme ;
- dimensionner un service d'inférence sous charge.

## Introduction

À faible concurrence, une inférence peut sembler simple : requête → modèle → réponse. En production, plusieurs utilisateurs partagent le même GPU, les contextes ont des longueurs différentes et les requêtes peuvent arriver simultanément.

Le problème devient alors celui d'un système distribué soumis à des contraintes de calcul et de mémoire.

## Concept

Une architecture de service peut être représentée ainsi :

~~~
clients
  ↓
API
  ↓
scheduler
  ↓
dynamic batching
  ↓
GPU workers
  ↓
streaming / result
  ↓
metrics
~~~

Mesure au minimum :
- time to first token (TTFT) ;
- temps total ;
- tokens/seconde ;
- concurrence ;
- throughput ;
- p50/p95/p99.

Le p99 est important : une moyenne peut rester bonne alors qu'une partie des utilisateurs subit une forte attente.

## Exemple

Avec 32 requêtes concurrentes, le batching dynamique regroupe les requêtes compatibles.

~~~
arrivées → file courte → batch → GPU → tokens
              ↑
          scheduler
~~~

Un batch plus grand peut améliorer l'utilisation du GPU. Mais si le scheduler attend trop longtemps pour remplir ce batch, le TTFT et le p99 augmentent.

## Comment ça fonctionne

Le KV cache conserve des états d'attention déjà calculés pour éviter de recalculer tout le contexte à chaque nouveau token. Il réduit le travail de calcul, mais consomme de la mémoire.

À forte concurrence ou avec de longs contextes, cette mémoire peut devenir une contrainte majeure. Le dimensionnement doit donc considérer simultanément :
- taille du modèle ;
- précision ;
- longueur des contextes ;
- nombre de séquences actives ;
- taille du KV cache ;
- mémoire disponible ;
- débit cible.

Le scale-out horizontal consiste à répartir les requêtes sur plusieurs workers. L'autoscaling doit tenir compte de la capacité réelle d'un worker, du temps de démarrage et du coût. Une file non bornée peut masquer la saturation plutôt que la résoudre : le backpressure doit faire partie de la conception.

## Erreurs fréquentes

- regarder uniquement la moyenne ;
- augmenter le batch sans mesurer TTFT et p99 ;
- oublier la mémoire du KV cache ;
- dimensionner uniquement selon le nombre de requêtes ;
- créer une file infinie ;
- autoscaler sur une métrique trop lente ou mal corrélée à la charge ;
- ignorer les cold starts et le coût.

## Exercices
- Le throughput augmente après activation du batching dynamique, mais le p99 devient mauvais. Quelle analyse mener ?

:::indice
Mesure séparément le temps d'attente avant batch, la durée GPU, la taille des batches et la distribution des longueurs.
:::
:::solution
Comparer la baseline et la version batchée avec la même charge. Mesurer TTFT, p50/p95/p99, taille des batches, temps d'attente du scheduler, saturation GPU et longueur des contextes. Réduire le délai de batching ou adapter la politique de regroupement si le gain de throughput ne respecte plus le SLO de latence.
:::
## À retenir

L'inférence haute performance est un problème de scheduling, mémoire, concurrence et latence. Une optimisation utile doit améliorer une contrainte sans violer les SLO des utilisateurs.

## Questions d'entretien
- Pourquoi suivre TTFT et p99 ?
  - À quoi sert le KV cache ?
  - Pourquoi une file non bornée est-elle dangereuse ?
  - Quand faut-il scaler horizontalement ?

:::indice
Relie chaque réponse à une contrainte système mesurable.
:::
:::reponse
TTFT mesure la réactivité initiale et p99 révèle la queue de distribution. Le KV cache évite des recalculs d'attention au prix de mémoire. Une file non bornée transforme la saturation en latence croissante. Le scale-out devient pertinent lorsque la concurrence, la mémoire ou le débit dépassent la capacité d'un worker et que plusieurs instances peuvent absorber la charge.
:::