---
id: ai-ml-unsupervised
title: "Machine Learning non supervisé"
slug: non-supervise
technology: ai-engineering
level: intermediate
module: machine-learning
order: 2
estimatedMinutes: 50
difficulty: 3
xp: 110
prerequisites: [ai-ml-supervised]
skills: [ai-ml-basics]
tags: [clustering, dimensionality-reduction, anomaly]
---

## Objectifs

À la fin de ce chapitre, tu dois pouvoir expliquer ce que cherche un algorithme non supervisé, comprendre K-means et PCA, et surtout savoir pourquoi une structure trouvée par un algorithme doit être interprétée avant d'être utilisée.

## Introduction

Dans beaucoup de projets, les données ne possèdent pas de label fiable. Tu peux avoir des milliers de clients et leurs comportements, sans savoir à l'avance quelles catégories devraient exister.

Le non supervisé inverse alors la question. Au lieu de demander « quelle est la bonne réponse ? », on demande « quelle structure semble présente dans ces données ? ».

## Concept

Le clustering cherche à regrouper des observations qui se ressemblent selon une représentation et une mesure de distance données.

Avec K-means, on choisit un nombre de groupes $k$. L'algorithme initialise des centroïdes, affecte chaque point au centroïde le plus proche, recalcule les centroïdes, puis répète jusqu'à stabilisation.

```text
données
  ↓
représentation
  ↓
choix de k
  ↓
affectation aux centroïdes
  ↓
recalcul des centroïdes
  ↓
répétition
  ↓
clusters
```

Le point important est que le cluster n'est pas une vérité découverte par magie. Il dépend des features, de leur échelle, de la distance et du choix de $k$.

## Exemple

Supposons que tu regroupes des clients selon le montant dépensé et le nombre de commandes. Si le montant varie de 0 à 100 000 alors que le nombre de commandes varie de 0 à 20, une distance brute peut être dominée par le montant.

Une normalisation peut donc être nécessaire avant le clustering. Ensuite, il faut examiner les caractéristiques de chaque groupe et vérifier s'ils correspondent à une décision utile.

## Comment ça fonctionne

La réduction de dimension répond à un autre problème. PCA cherche des directions qui expliquent une grande partie de la variance et projette les données sur ces directions.

```text
features nombreuses
       ↓
      PCA
       ↓
représentation réduite
       ↓
visualisation / modèle
```

Une visualisation 2D peut être très utile pour explorer les données, mais elle ne prouve pas que la structure réelle du problème est bidimensionnelle.

La détection d'anomalies suit encore une autre logique. Une observation rare ou éloignée peut être intéressante, mais « inhabituel » ne signifie pas automatiquement « fraude ». L'interprétation métier reste indispensable.

Les embeddings peuvent aussi servir à regrouper ou rechercher des contenus. Dans ce cas, la qualité dépend du modèle d'embedding, des données et de la métrique utilisée.

## Erreurs fréquentes

Il est dangereux de donner un nom métier à un cluster uniquement parce qu'il apparaît sur un graphique. Il faut aussi éviter de changer l'échelle des variables sans comprendre l'effet sur les distances et de considérer le nombre de clusters comme une vérité objective.

## Exercices
- Tu observes trois clusters de clients. Décris comment tu vérifierais qu'ils sont stables et réellement utiles.

:::indice
Ne regarde pas seulement le graphique. Compare la structure avec plusieurs métriques et avec une décision métier réelle.
::

:::solution
Tester la stabilité sur plusieurs échantillons ou initialisations, examiner la séparation avec des métriques adaptées, profiler les caractéristiques des groupes et vérifier qu'ils permettent une action ou une décision utile.
::
## À retenir

Le non supervisé est avant tout un outil d'exploration et de représentation. L'algorithme produit une structure ; l'ingénieur doit ensuite déterminer si cette structure est robuste et pertinente.

## Questions d'entretien
- Pourquoi normaliser certaines features avant un clustering basé sur une distance ?

:::indice
Imagine deux variables dont les ordres de grandeur sont très différents.
::

:::reponse
Sans normalisation, une variable de grande amplitude peut dominer la distance et donc influencer presque entièrement les groupes obtenus.
::