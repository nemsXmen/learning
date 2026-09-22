---
id: ai-09-metrics
title: "Métriques d'évaluation"
slug: evaluation-metrics
technology: ai-engineering
level: advanced
module: evaluation
order: 3
estimatedMinutes: 100
difficulty: 5
xp: 220
prerequisites: [ai-09-datasets]
skills: [ai-evaluation]
tags: [evaluation, metrics, precision, recall, ranking, calibration, pass-at-k]
---

## Objectifs

- choisir une métrique en fonction du contrat d'évaluation ;
- calculer et interpréter les métriques de classification ;
- évaluer un système de recherche ou de ranking ;
- comprendre les limites de la similarité sémantique ;
- mesurer génération et sélection de plusieurs réponses ;
- éviter les conclusions abusives à partir d'un score unique.

## Introduction

Une métrique est une fonction qui transforme des observations en signal mesurable. Elle ne définit pas à elle seule ce qu'est une bonne réponse.

Une métrique pertinente doit être alignée sur le risque et le comportement que le produit cherche à contrôler. Dans un système IA, plusieurs métriques complémentaires sont généralement nécessaires.

## Concept

### Classification : precision, recall et F1

Pour une classe positive :

- TP : vrais positifs ;
- FP : faux positifs ;
- FN : faux négatifs ;
- TN : vrais négatifs.

Les métriques classiques sont :

precision = TP / (TP + FP)

recall = TP / (TP + FN)

F1 = 2 × precision × recall / (precision + recall)

La precision répond à « parmi les positifs prédits, combien sont corrects ? ». Le recall répond à « parmi les vrais positifs, combien avons-nous retrouvés ? ».

Le choix dépend du coût relatif des faux positifs et faux négatifs.

### Exact match et token-level metrics

L'exact match exige une égalité complète avec la référence. Il est adapté à des sorties structurées ou à certaines tâches fermées, mais trop strict pour de nombreuses réponses en langage naturel.

Des métriques token-level comme precision, recall et F1 peuvent être plus tolérantes, mais elles ne comprennent pas le sens.

Deux formulations correctes peuvent avoir peu de tokens en commun.

### Similarité sémantique

Des embeddings permettent de comparer des représentations vectorielles. Cela peut détecter une proximité de sens malgré des formulations différentes.

Mais une forte similarité n'implique pas la factualité. Une réponse fausse peut être très proche sémantiquement d'une référence insuffisante ou incorrecte.

La similarité doit donc rester un signal parmi d'autres.

### Ranking : MRR et nDCG

Pour un moteur de recherche ou un retriever, l'ordre des résultats compte.

Le Mean Reciprocal Rank mesure notamment la position du premier résultat pertinent :

RR = 1 / rang_du_premier_resultat_pertinent

MRR = moyenne(RR)

Le nDCG prend en compte plusieurs niveaux de pertinence et pénalise les résultats pertinents placés trop bas.

### Recall@k

Recall@k mesure la proportion des éléments pertinents retrouvés dans les k premiers résultats.

Pour un retriever RAG, un recall@k élevé indique que les preuves pertinentes ont de bonnes chances d'être disponibles dans le contexte. Il ne garantit pas que le LLM les utilisera correctement.

### Pass@k

Pour des tâches de génération de code ou de solutions multiples, on peut chercher la probabilité qu'au moins une des k générations passe un test.

Le concept répond à une question différente d'une accuracy sur une seule sortie : « le système peut-il produire une solution correcte dans son budget de tentatives ? ».

Augmenter k augmente généralement coût et latence.

### Calibration

Une probabilité annoncée de 0,9 devrait correspondre approximativement à un taux de succès de 90 % sur une population comparable.

Une prédiction peut être très précise en moyenne mais mal calibrée.

La calibration est importante lorsque le score est utilisé pour déclencher automatiquement une action ou demander une revue humaine.

## Exemple

Supposons 100 alertes de fraude :

- 20 sont réellement frauduleuses ;
- le modèle en détecte 15 ;
- 3 alertes sont fausses.

Alors :

- TP = 15 ;
- FP = 3 ;
- FN = 5.

Donc :

precision = 15 / 18 = 83,3 %

recall = 15 / 20 = 75 %

F1 ≈ 78,9 %

Dire simplement « le modèle est précis à 83 % » serait incomplet : le recall révèle que 25 % des fraudes de cette population n'ont pas été détectées.

## Comment ça fonctionne

### 1. Définir le type de sortie

Avant la métrique, identifiez le problème : classification, extraction structurée, ranking, génération libre, récupération documentaire, génération de code ou décision avec seuil.

### 2. Définir les coûts d'erreur

Construisez une matrice des conséquences.

Dans un système de sécurité, un faux négatif peut être beaucoup plus coûteux qu'un faux positif. Dans un outil de productivité, l'inverse peut parfois être vrai.

### 3. Combiner métriques globales et slices

Calculez le score global puis par slice : domaine, langue, difficulté, risque, longueur, modèle ou version de prompt.

### 4. Mesurer l'incertitude

Deux versions avec 90 % et 91 % ne sont pas nécessairement réellement différentes si le dataset est petit.

Pour une proportion, une approximation simple peut utiliser :

SE ≈ sqrt(p(1-p)/n)

Pour des comparaisons importantes, utilisez des méthodes statistiques adaptées au protocole et à la dépendance entre observations.

### 5. Relier métrique et décision

Une métrique devient utile lorsqu'elle influence une décision explicite : accepter, rejeter, demander une revue, lancer une investigation ou bloquer un déploiement.

Documentez le seuil, sa justification et son coût d'erreur.

## Erreurs fréquentes

- choisir une métrique parce qu'elle est populaire ;
- optimiser une métrique sans vérifier le comportement réel ;
- utiliser la similarité sémantique comme preuve de factualité ;
- comparer des scores sur des datasets différents ;
- ignorer la taille de l'échantillon ;
- publier une moyenne sans slices ;
- confondre precision et recall ;
- augmenter k sans compter le coût ;
- utiliser une probabilité non calibrée comme décision certaine.

## Exercices

1. **Exercice 1 — Precision ou recall ?**

Un système doit détecter des transactions frauduleuses et rater une fraude est beaucoup plus coûteux que déclencher une alerte supplémentaire. Quelle dimension faut-il surveiller particulièrement ?

:::indice
Regardez la définition du faux négatif.
:::

:::solution
Le recall est particulièrement important car il mesure la proportion des fraudes réellement présentes qui sont détectées. Il faut néanmoins suivre precision et coût opérationnel des alertes.
:::

2. **Exercice 2 — Retriever RAG**

Sur 10 documents pertinents, le retriever en retrouve 8 dans son top-5. Calculez le recall@5.

:::indice
Utilisez pertinents retrouvés / pertinents attendus.
:::

:::solution
recall@5 = 8 / 10 = 80 %. Ce score ne dit pas encore si les documents sont correctement utilisés par le générateur.
:::

3. **Exercice 3 — Score trompeur**

Une nouvelle version augmente la similarité sémantique moyenne de 0,82 à 0,87, mais introduit davantage d'affirmations non supportées. Comment interpréter le résultat ?

:::indice
Une métrique ne couvre qu'une dimension.
:::

:::solution
La similarité s'est améliorée selon cette métrique, mais la factualité s'est dégradée. Il faut ajouter un signal de groundedness/faithfulness et examiner les cas concernés plutôt que conclure à une amélioration globale.
:::

## À retenir

Une métrique répond à une question précise. Precision, recall, F1, ranking metrics, similarité sémantique, pass@k et calibration ne sont pas interchangeables.

Un système de production doit combiner plusieurs métriques, les analyser par slices et tenir compte de l'incertitude, du coût et des conséquences des erreurs.

## Questions d'entretien

1. **Pourquoi F1 ne suffit-il pas pour évaluer un système ?**

:::indice
F1 combine deux dimensions mais ne couvre pas tous les risques.
:::

:::reponse
F1 résume precision et recall, mais ne mesure pas nécessairement calibration, coût, latence, sécurité, qualité sémantique ou comportement par slice.
:::

2. **Pourquoi Recall@k est-il utile en RAG ?**

:::indice
Pensez à la disponibilité des preuves dans le contexte.
:::

:::reponse
Il mesure la proportion des éléments pertinents récupérés dans les k premiers résultats. Il renseigne donc sur la capacité du retriever à fournir les preuves nécessaires, sans garantir leur bonne utilisation par le générateur.
:::

3. **Pourquoi une amélioration de score de 90 % à 91 % doit-elle être interprétée avec prudence ?**

:::indice
Le nombre de cas et la variance comptent.
:::

:::reponse
Une différence d'un point peut être compatible avec l'incertitude statistique, surtout sur un petit dataset. Il faut considérer la taille de l'échantillon, les intervalles de confiance et la dépendance entre observations.
:::
