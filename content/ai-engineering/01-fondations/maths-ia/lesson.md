---
id: ai-maths
title: "Mathématiques pour l'IA : vecteurs, probabilités et statistiques"
slug: maths-ia
technology: ai-engineering
level: beginner
module: fondations
order: 4
estimatedMinutes: 75
difficulty: 3
xp: 130
prerequisites: [ai-git-reproductibilite]
skills: [ai-linear-algebra, ai-probability]
tags: [maths, statistiques, probabilites, vectors]
---

## Objectifs

## Introduction

Les mathématiques permettent de comprendre ce que mesurent les modèles et les métriques au lieu de traiter leurs sorties comme des nombres magiques.

## Concept

Vecteurs, matrices, probabilités et statistiques fournissent le vocabulaire nécessaire pour comprendre embeddings, attention, incertitude et évaluation.

## Exemple

La similarité cosinus compare l'orientation de deux embeddings, tandis que moyenne et dispersion permettent d'analyser une métrique sur plusieurs segments.

## Comment ça fonctionne

Les opérations vectorielles décrivent les représentations, les probabilités modélisent l'incertitude et les statistiques permettent d'interpréter des résultats issus d'échantillons.


- manipuler les notions de vecteur, matrice, produit scalaire et norme ;
- comprendre pourquoi les embeddings peuvent être comparés par similarité ;
- distinguer moyenne, variance et écart-type ;
- raisonner avec probabilité conditionnelle ;
- comprendre pourquoi une métrique seule ne suffit pas pour évaluer un système IA.

## Pourquoi apprendre les maths sans devenir mathématicien

L'objectif n'est pas de faire des calculs à la main pendant toute une carrière.

L'objectif est de pouvoir lire et questionner les outils que tu utilises.

Quand tu verras :

```text
embedding
cosine similarity
cross-entropy
gradient
precision / recall
confidence
```

tu dois comprendre ce que mesure le concept, quelles hypothèses il suppose et dans quel cas son interprétation peut être trompeuse.

## Vecteurs : représenter un objet par des nombres

Un vecteur peut représenter un point dans un espace :

```text
x = [x₁, x₂, x₃]
```

En machine learning, une ligne de données peut devenir un vecteur de caractéristiques.

Dans un système de recherche sémantique, un texte peut être transformé en embedding :

```text
texte → modèle d'embedding → [0.12, -0.31, 0.77, ...]
```

Le vecteur n'est pas « le sens » sous forme magique. C'est une représentation numérique apprise qui permet ensuite certaines opérations géométriques utiles.

## Produit scalaire

Pour deux vecteurs :

```text
a = [a₁, a₂]
b = [b₁, b₂]

a · b = a₁b₁ + a₂b₂
```

Le produit scalaire combine les composantes et intervient notamment dans l'attention des Transformers.

Deux vecteurs ayant une orientation proche peuvent avoir un produit scalaire élevé, selon leurs normes.

## Norme et distance

La norme euclidienne d'un vecteur est :

```text
||x||₂ = √(x₁² + x₂² + ... + xₙ²)
```

Elle mesure sa longueur.

La distance euclidienne entre deux points mesure leur écart géométrique. Mais dans les embeddings, la distance choisie doit être cohérente avec le modèle et l'index de recherche.

## Similarité cosinus

La similarité cosinus est :

```text
cos(a,b) = (a · b) / (||a|| ||b||)
```

Elle compare principalement l'orientation.

Un point essentiel : un score de similarité n'est pas une preuve de vérité.

Deux documents peuvent être très proches dans l'espace vectoriel tout en contenant une information incorrecte ou obsolète.

## Probabilité conditionnelle

La probabilité conditionnelle répond à :

```text
P(A | B)
```

qui signifie : probabilité de A sachant B.

Cette notion est centrale dans l'IA parce que beaucoup de prédictions peuvent être vues comme une estimation conditionnelle.

Exemple conceptuel :

```text
P(classe = fraude | caractéristiques_transaction)
```

Attention à ne pas confondre :

```text
P(A | B) avec P(B | A)
```

Le changement de condition change généralement la valeur.

## Moyenne, variance et écart-type

La moyenne décrit le centre d'un ensemble.

La variance mesure la dispersion autour de la moyenne :

```text
variance = moyenne[(x - moyenne)²]
```

L'écart-type est la racine carrée de la variance.

Pourquoi est-ce utile ?

Parce que deux modèles peuvent avoir la même moyenne de performance mais des comportements très différents selon les segments.

Exemple :

```text
modèle A : 90, 90, 90, 90
modèle B : 100, 100, 100, 60
```

La moyenne seule masque une différence importante.

## Corrélation n'est pas causalité

Si deux variables évoluent ensemble, cela ne prouve pas que l'une provoque l'autre.

En IA produit, une corrélation entre « utilisateurs exposés au chatbot » et « conversion » peut venir d'un troisième facteur : les utilisateurs exposés sont peut-être déjà plus engagés.

Un AI Engineer doit donc distinguer :

```text
association observée
≠
causalité démontrée
```

## Incertitude et échantillonnage

Une métrique calculée sur 20 exemples est moins informative qu'une métrique calculée sur 20 000 cas comparables, mais le volume seul ne garantit pas la représentativité.

Il faut demander :

- qui est dans l'échantillon ?
- qui est absent ?
- comment les cas ont-ils été sélectionnés ?
- quelle est la variabilité du résultat ?
- le jeu d'évaluation ressemble-t-il au trafic réel ?

C'est cette discipline qui prépare aux modules d'évaluation.

## Erreurs fréquentes

- croire qu'un score numérique possède une signification universelle ;
- confondre similarité et vérité ;
- interpréter une moyenne sans regarder la distribution ;
- confondre corrélation et causalité ;
- ignorer le biais d'échantillonnage ;
- apprendre une formule sans comprendre ce qu'elle mesure.

## Exercices

- Calcule le produit scalaire de `[1, 2]` et `[3, 4]`.
- Deux systèmes ont respectivement 95 % et 90 % de précision. Quelles informations supplémentaires demandes-tu avant de conclure ?
- Pourquoi deux documents proches selon une similarité cosinus peuvent-ils malgré tout être incompatibles ?

:::indice
Pour les exercices d'évaluation, cherche les informations que la métrique ne contient pas.
:::

:::solution
Le produit scalaire vaut `1×3 + 2×4 = 11`. Pour comparer les systèmes, demande notamment le dataset, la distribution des classes, le recall, les performances par segment et les intervalles d'incertitude pertinents. Une similarité cosinus mesure une proximité dans un espace appris, pas la véracité ni la compatibilité logique des documents.
:::

## À retenir

Les maths de l'AI Engineer servent surtout à développer une intuition quantitative : représentation vectorielle, similarité, probabilité, dispersion et incertitude. Cette intuition devient indispensable dès qu'on construit ou évalue un modèle.

## Questions d'entretien

- Pourquoi la similarité cosinus est-elle utile pour les embeddings ?
- Pourquoi une moyenne de score peut-elle être trompeuse ?
- Quelle différence entre corrélation et causalité ?

:::indice
Relie chaque réponse à un cas concret de système IA.
:::

:::reponse
La similarité cosinus compare l'orientation de représentations vectorielles. Une moyenne peut masquer des écarts importants entre segments ou exemples. Une corrélation décrit une association statistique et ne démontre pas qu'une variable cause l'autre.
:::
