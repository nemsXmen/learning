---
id: ai-09-metrics
title: "Métriques d'évaluation"
slug: metrics
technology: ai-engineering
level: advanced
module: evaluation
order: 3
estimatedMinutes: 90
difficulty: 5
xp: 200
prerequisites: [ai-09-datasets]
skills: [ai-evaluation]
tags: [evaluation, metrics, classification, rag, ranking, calibration]
---

## Objectifs

- choisir une métrique à partir du type de sortie et du risque métier ;
- distinguer precision, recall, F1 et les métriques de ranking ;
- comprendre les limites d'Exact Match et de la similarité sémantique ;
- utiliser Recall@k et pass@k sans surinterpréter leur score ;
- intégrer coût, latence, calibration et incertitude dans le protocole.

## Introduction

Une métrique n'est pas une note générale donnée à un système IA. Elle mesure une propriété précise sur une population précise.

Le choix correct commence donc par la question à laquelle l'équipe veut répondre : « qu'est-ce qu'un échec et quelle conséquence doit-il éviter ? ». Une métrique populaire mais mal alignée avec cette question peut conduire à optimiser le mauvais comportement.

## Concept

### Classification : precision, recall et F1

Pour une tâche binaire :

- **precision** = TP / (TP + FP) : parmi les prédictions positives, quelle proportion est correcte ;
- **recall** = TP / (TP + FN) : parmi les positifs réels, quelle proportion est retrouvée ;
- **F1** = moyenne harmonique de precision et recall.

Le choix dépend du coût des erreurs. Pour une détection de fraude, manquer une fraude peut être plus grave qu'une alerte supplémentaire. Il faut alors surveiller particulièrement le recall, tout en conservant la precision et le coût opérationnel.

### Exact Match et sorties structurées

Exact Match est adapté lorsque la sortie attendue est réellement exacte : identifiant, classe, valeur normalisée ou structure canonique.

Pour du JSON, une validation de schéma peut être plus utile qu'une comparaison textuelle. Elle permet de séparer :

1. validité syntaxique ;
2. conformité du schéma ;
3. exactitude des champs ;
4. contraintes métier.

Pour une réponse libre, exiger une chaîne identique peut pénaliser deux réponses équivalentes.

### Similarité sémantique

Les embeddings permettent de mesurer une proximité entre une sortie et une référence. C'est utile lorsque plusieurs formulations peuvent être correctes.

Mais la similarité ne prouve ni la factualité ni la sécurité. Une réponse fausse peut être très proche d'une référence incomplète ou elle-même incorrecte.

La similarité doit donc être utilisée comme un signal parmi d'autres.

### Ranking : MRR et nDCG

Pour un retriever ou un moteur de recherche, l'ordre des résultats compte.

**MRR** mesure principalement la position du premier résultat pertinent :

`RR = 1 / rang_du_premier_resultat_pertinent`

`MRR = moyenne(RR)`

**nDCG** prend en compte plusieurs résultats et différents niveaux de pertinence. Il est utile lorsque plusieurs documents peuvent être pertinents mais avec une importance différente.

### Recall@k

Recall@k mesure la proportion des éléments pertinents retrouvés dans les k premiers résultats.

En RAG, un Recall@k élevé indique que les preuves pertinentes ont de bonnes chances d'entrer dans le contexte. Il ne prouve pas que le générateur les utilisera correctement ni qu'il produira une réponse fidèle.

Il faut donc distinguer :

`retrieval recall -> context quality -> generation correctness -> groundedness`

### Pass@k

Pour la génération de code ou d'autres tâches où plusieurs tentatives sont possibles, pass@k répond à une question différente de l'accuracy sur une seule sortie : le système peut-il produire au moins une solution correcte dans un budget de k tentatives ?

Augmenter k peut améliorer la probabilité de réussite tout en augmentant coût et latence. Le budget doit donc faire partie du protocole.

### Calibration et incertitude

Une probabilité de 0,9 devrait correspondre approximativement à 90 % de succès sur une population comparable si le système est bien calibré.

Une bonne accuracy ne garantit pas une bonne calibration. Si une probabilité déclenche une action automatique ou un passage en revue humaine, la calibration devient une propriété importante.

De même, une différence de score entre deux versions doit être interprétée avec la taille du dataset et l'incertitude. Un gain de 90 % à 91 % n'a pas la même signification sur 100 cas et sur 100 000 cas.

## Exemple

Supposons 100 alertes de fraude :

- 20 sont réellement frauduleuses ;
- le système en détecte 15 ;
- 3 alertes sont fausses.

Alors :

- TP = 15 ;
- FP = 3 ;
- FN = 5 ;
- precision = 15 / 18 = 83,3 % ;
- recall = 15 / 20 = 75 % ;
- F1 ≈ 78,9 %.

Dire seulement « le modèle est précis à 83 % » serait trompeur : le recall montre que 25 % des fraudes de cette population ne sont pas détectées.

## Comment ça fonctionne

### 1. Identifier le type de problème

Avant de choisir une métrique, classifiez la tâche : classification, extraction, génération libre, ranking, retrieval, génération de code ou décision avec seuil.

### 2. Relier la métrique au coût d'erreur

Définissez les conséquences des faux positifs et faux négatifs. Une métrique devient utile lorsqu'elle influence une décision explicite : accepter, rejeter, demander une revue, investiguer ou bloquer une release.

### 3. Mesurer par slices

Calculez le résultat global puis par dimensions pertinentes : langue, domaine, difficulté, risque, longueur, tenant, modèle, version de prompt ou type d'outil.

Une moyenne peut rester stable alors qu'une slice critique régresse fortement.

### 4. Combiner les signaux

Un système de production peut suivre simultanément :

| Dimension | Exemples de signaux |
| --- | --- |
| Exactitude | precision, recall, F1, exact match |
| Retrieval | Recall@k, MRR, nDCG |
| Génération | critères structurés, similarité, judge |
| Factualité | groundedness, support des citations |
| Fiabilité | taux d'erreur, timeout, retries |
| Opérations | latence, tokens, coût |
| Décision | calibration, taux de revue humaine |

Aucune ligne ne remplace les autres : elles répondent à des questions différentes.

### 5. Comparer sur le même protocole

Pour comparer deux versions, conservez la même population lorsque le protocole le permet, ainsi que les versions du dataset, modèle, prompt et outils.

Analysez ensuite les cas qui ont changé, pas seulement la moyenne.

## Erreurs fréquentes

- choisir une métrique parce qu'elle est populaire ;
- confondre precision et recall ;
- utiliser la similarité sémantique comme preuve de factualité ;
- publier uniquement une moyenne globale ;
- comparer deux scores issus de populations différentes ;
- ignorer la taille de l'échantillon et l'incertitude ;
- augmenter k sans mesurer coût et latence ;
- utiliser une probabilité non calibrée comme décision certaine ;
- laisser un LLM-as-a-judge devenir l'unique source de vérité ;
- définir un seuil sans relier ce seuil au risque et à l'action déclenchée.

## Exercices

1. **Precision ou recall ?**

Un système doit détecter des transactions frauduleuses et manquer une fraude est beaucoup plus coûteux qu'une alerte supplémentaire. Quelles métriques surveillez-vous et pourquoi ?

:::indice
Commencez par le coût relatif des faux négatifs et faux positifs.
:::
:::solution
Le recall devient particulièrement important car il mesure les fraudes retrouvées. Il faut néanmoins conserver precision, volume d'alertes et coût de revue pour éviter de transformer chaque transaction en alerte.
:::

2. **Retriever RAG**

Sur 10 documents pertinents, le retriever en retrouve 8 dans son top-5. Calculez Recall@5 et expliquez ce que le score ne garantit pas.

:::indice
Utilisez pertinents retrouvés / pertinents attendus.
:::
:::solution
Recall@5 = 8 / 10 = 80 %. Le score ne garantit ni que les documents sont correctement placés dans le contexte final, ni que le générateur les utilisera correctement.
:::

3. **Score trompeur**

Une nouvelle version augmente la similarité sémantique moyenne de 0,82 à 0,87 mais introduit davantage d'affirmations non supportées. Comment analyser cette évolution ?

:::indice
Une métrique ne couvre qu'une dimension.
:::
:::solution
La similarité s'est améliorée selon ce signal, mais la factualité s'est dégradée. Il faut ajouter un signal de groundedness ou de support des affirmations et analyser les cas concernés.
:::

## À retenir

Une métrique répond à une question précise. Precision, recall, F1, ranking metrics, similarité sémantique, Recall@k, pass@k et calibration ne sont pas interchangeables.

Une évaluation de niveau production combine plusieurs signaux, les segmente par slices et relie les seuils aux conséquences opérationnelles. Le score n'est utile que si le protocole, la population et la décision associée sont explicites.

## Questions d'entretien

1. **Pourquoi F1 ne suffit-il pas pour évaluer un système IA ?**

:::indice
F1 résume precision et recall mais ne couvre pas tous les risques.
:::
:::reponse
F1 ne mesure pas directement calibration, coût, latence, sécurité, factualité, retrieval ou comportement par slice. Il faut sélectionner d'autres signaux selon la tâche et le risque.
:::

2. **Pourquoi Recall@k est-il utile en RAG ?**

:::indice
Pensez à la disponibilité des preuves.
:::
:::reponse
Il mesure la capacité du retriever à placer les éléments pertinents dans les k premiers résultats. Il ne garantit cependant ni leur bonne utilisation ni la fidélité de la réponse finale.
:::

3. **Pourquoi un gain de 90 % à 91 % doit-il être interprété avec prudence ?**

:::indice
Le protocole et la taille du dataset comptent.
:::
:::reponse
La différence dépend notamment de la taille de l'échantillon, de la variabilité et du protocole de comparaison. Il faut vérifier l'incertitude et examiner les slices et les cas qui ont changé avant de conclure.
:::
