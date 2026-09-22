---
id: ai-15-launch
title: "Capstone : lancer, observer et faire évoluer"
slug: launch
technology: ai-engineering
level: expert
module: capstone
order: 4
estimatedMinutes: 100
difficulty: 5
xp: 250
prerequisites: [ai-15-evaluate]
skills: [ai-capstone]
tags: [capstone, architecture, rag, agents, production]
---

## Objectifs
- préparer un lancement progressif ;
- définir les signaux de santé du système ;
- gérer incidents, quotas et coûts ;
- exécuter un rollback ;
- organiser le cycle d'amélioration après lancement.

## Introduction

Le lancement n'est pas la dernière étape technique. C'est le passage d'un système évalué en environnement contrôlé à un système exposé à des utilisateurs, des données et des comportements réels.

Il faut donc réduire le rayon d'explosion d'un changement et rendre le retour arrière rapide.

## Concept

Un rollout progressif peut suivre ce flux :

~~~text
staging
   ↓
tests + evaluation
   ↓
internal users
   ↓
small cohort
   ↓
monitoring
   ↓
wider rollout
   ↓
production
~~~

Chaque étape possède des critères d'arrêt. Une nouvelle version de modèle, prompt, retrieval ou tool doit rester identifiable.

## Exemple

Un changement de modèle augmente le coût par tâche.

Avant :

~~~text
$0.012 / tâche
p95 = 2.1 s
quality = 91%
~~~

Après :

~~~text
$0.024 / tâche
p95 = 2.2 s
quality = 91%
~~~

Il faut alors analyser les tokens d'entrée/sortie, le contexte récupéré, les retries, la longueur des réponses et le tarif fournisseur. Le coût doit être observé au niveau tâche, tenant et période.

## Comment ça fonctionne

Prépare avant le lancement :
- health checks ;
- dashboards ;
- alertes ;
- quotas et budgets ;
- secrets ;
- migrations compatibles ;
- procédure de rollback ;
- runbook d'incident ;
- contact d'escalade.

Un incident doit suivre une boucle claire :

~~~text
detect
  ↓
contain
  ↓
mitigate
  ↓
decide rollback/fix
  ↓
recover
  ↓
postmortem
  ↓
prevent recurrence
~~~

Le rollback doit être possible sans perdre les données métier. Les migrations de schéma doivent donc être compatibles avec les versions en cours pendant un déploiement progressif.

## Erreurs fréquentes

- déployer tout le trafic immédiatement ;
- ne pas savoir quelle version est en production ;
- surveiller uniquement les erreurs HTTP ;
- ignorer coût et consommation tokens ;
- ne pas avoir de budget ou quota ;
- préparer le rollback après l'incident ;
- modifier plusieurs variables simultanément sans pouvoir attribuer la régression.

## Exercices
- Le coût par tâche double après un changement de modèle alors que la qualité reste stable. Que vérifier ?

:::indice
Compare l'usage réel avant/après : tokens, contexte, retries, longueur des réponses et tarif.
::

:::solution
Comparer tokens d'entrée et de sortie, taille du contexte récupéré, nombre de retries, longueur des réponses, modèle réellement appelé et tarif fournisseur. Vérifier aussi les changements de routing ou de cache. Corriger la cause puis refaire l'évaluation avant de généraliser.
::
## À retenir

Un AI SaaS production doit être versionné, observable, réversible et soumis à des limites de coût et de sécurité.

## Questions d'entretien
- Pourquoi déployer progressivement un changement de modèle ?
  - Que doit contenir un runbook IA ?
  - Quels signaux surveiller après lancement ?
  - Pourquoi versionner prompts et modèles ?

:::indice
Relie chaque pratique à la capacité de détecter, diagnostiquer et corriger rapidement.
::

:::reponse
Le rollout progressif limite l'impact d'une régression. Un runbook décrit détection, mitigation, rollback, récupération et postmortem. Il faut suivre qualité, erreurs, latence, tokens, coût, quotas et sécurité. Le versioning permet d'identifier précisément la cause d'une régression et de reproduire un comportement.
::