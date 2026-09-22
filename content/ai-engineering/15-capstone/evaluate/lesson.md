---
id: ai-15-evaluate
title: "Capstone : évaluer qualité, coût, latence et sécurité"
slug: evaluate
technology: ai-engineering
level: expert
module: capstone
order: 3
estimatedMinutes: 100
difficulty: 5
xp: 240
prerequisites: [ai-15-build]
skills: [ai-capstone]
tags: [capstone, architecture, rag, agents, production]
---

## Objectifs
- construire un golden dataset représentatif ;
- mesurer qualité, groundedness, coût et latence ;
- tester les régressions par segment ;
- évaluer retrieval, génération et tools séparément ;
- intégrer des critères de sécurité dans la release.

## Introduction

Un système IA peut sembler meilleur tout en devenant moins fiable sur les cas importants. Une moyenne globale masque facilement une régression sur les requêtes sensibles, les documents rares ou les erreurs d'outils.

Le capstone doit donc posséder un protocole d'évaluation reproductible avant son lancement.

## Concept

Le golden dataset doit contenir plusieurs familles :

~~~text
normal
  ├── succès représentatifs
  ├── ambiguïtés
  ├── données manquantes
  ├── longues entrées
  ├── erreurs de retrieval
  ├── erreurs d'outils
  ├── adversarial / injection
  └── cas sensibles
~~~

Pour chaque version, exécute le même ensemble puis segmente les résultats.

Mesure selon le produit :
- exactitude ou critères métier ;
- validité du schéma ;
- recall du retrieval ;
- groundedness ;
- taux d'erreur ;
- p50/p95/p99 ;
- tokens et coût ;
- taux de refus ou d'escalade ;
- violations de sécurité.

## Exemple

Une nouvelle version obtient une meilleure moyenne :

~~~text
ancienne : 88% global / 98% sécurité
nouvelle : 91% global / 94% sécurité
~~~

La moyenne progresse, mais le segment sécurité régresse. Le dashboard global ne doit pas masquer cette information.

Le release gate peut donc combiner plusieurs contraintes :

~~~text
quality >= threshold
security >= threshold
p95 <= SLO
cost/task <= budget
schema_validity >= threshold
~~~

## Comment ça fonctionne

Construis les cas avec une vérité de référence ou une règle vérifiable lorsque c'est possible. Utilise un LLM-as-judge seulement lorsque la propriété est difficile à déterminer autrement, et contrôle régulièrement ses biais et sa stabilité.

Conserve :
- version du modèle ;
- version du prompt ;
- version du retrieval ;
- paramètres ;
- dataset ;
- résultats ;
- traces d'erreur.

Pour les agents, évalue également les trajectoires : nombre d'étapes, tools appelés, arguments, refus, erreurs et actions finales.

## Erreurs fréquentes

- n'avoir que des cas faciles ;
- évaluer uniquement la réponse finale ;
- utiliser une moyenne sans segmentation ;
- changer le dataset en même temps que le système ;
- considérer un judge comme une vérité absolue ;
- oublier les coûts et la latence ;
- ne pas avoir de seuils de release explicites.

## Exercices
- Une nouvelle version améliore la qualité moyenne mais échoue davantage sur les requêtes sensibles. Que montre l'évaluation ?

:::indice
Segmente les résultats et compare chaque catégorie à ses seuils, plutôt que de regarder uniquement la moyenne.
:::
:::solution
La moyenne masque une régression sur un segment critique. Il faut analyser les cas concernés, identifier la cause et appliquer le release gate défini pour la sécurité. Une amélioration globale ne compense pas automatiquement une violation d'un seuil critique.
:::
## À retenir

L'évaluation finale doit rendre les compromis visibles et empêcher qu'une moyenne favorable masque un risque critique.

## Questions d'entretien
- Pourquoi segmenter un golden dataset ?
  - Quand utiliser un LLM-as-judge ?
  - Comment évaluer un agent au-delà de sa réponse finale ?
  - Que faut-il versionner dans une évaluation ?

:::indice
Pense à la reproductibilité et à la localisation des erreurs.
:::
:::reponse
La segmentation révèle les régressions cachées. Un judge est utile pour des propriétés difficiles à vérifier par règles, mais doit être contrôlé. Un agent s'évalue aussi sur sa trajectoire et ses actions. Modèle, prompt, retrieval, paramètres, dataset et résultats doivent être versionnés.
:::