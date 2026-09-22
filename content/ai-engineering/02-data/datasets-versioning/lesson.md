---
id: ai-data-versioning
title: "Versionner datasets et artefacts AI"
slug: datasets-versioning
technology: ai-engineering
level: intermediate
module: data
order: 3
estimatedMinutes: 65
difficulty: 3
xp: 110
prerequisites: [ai-data-modelisation, ai-git-reproductibilite]
skills: [ai-experimentation]
tags: [datasets, versioning, lineage, experiments]
---

## Objectifs

À la fin de cette leçon, tu dois pouvoir versionner un dataset, retrouver exactement les données utilisées par une expérience et éviter de contaminer un jeu d'évaluation réservé.

## Introduction

En développement logiciel, un commit identifie une version du code. En IA, cela ne suffit pas.

Deux entraînements peuvent utiliser exactement le même commit Git et produire des résultats différents parce que le dataset, les paramètres, le modèle ou l'environnement ont changé.

Une expérience IA doit donc être considérée comme un ensemble de dépendances traçables.

## Concept

Une version de dataset peut être décrite par un manifeste :

```yaml
name: support-gold
version: 3
sha256: "..."
schema_version: 2
```

Le numéro de version décrit l'identité logique du dataset. Le hash permet de vérifier l'intégrité d'un contenu donné.

Le hash n'est cependant pas un système de versionnement complet. Il faut également savoir où le dataset est stocké, comment il a été produit et quelles transformations ont été appliquées.

## Exemple

Imaginons deux runs :

```text
run A
code: abc123
dataset: support-v3
model: model-x
prompt: v7

run B
code: abc123
dataset: support-v4
model: model-x
prompt: v7
```

Si le score change, nous avons déjà une hypothèse importante : les données ont changé.

Sans cette information, l'équipe peut passer des heures à chercher une différence dans le code qui n'existe pas.

## Comment ça fonctionne

La lineage permet de conserver la chaîne de transformation :

```text
source
  ↓
raw-v1
  ↓
cleaned-v3
  ↓
chunks-v8
  ↓
embeddings-v4
  ↓
index-v4
```

Chaque étape doit connaître l'identité de son entrée.

Une expérience peut alors enregistrer :

```text
commit
+ dataset version
+ preprocessing version
+ model/version
+ paramètres
+ evaluation set
```

Lorsqu'un résultat paraît anormal, on peut reconstruire le chemin au lieu de deviner.

## Protéger le jeu de test

Un jeu de test perd son indépendance si on l'utilise pour choisir continuellement les prompts, seuils ou paramètres.

Le cycle devient alors :

```text
test
 ↓
observation
 ↓
modification
 ↓
test
 ↓
observation
```

Le score finit par mesurer en partie notre adaptation au test.

Il faut donc conserver un jeu de référence qui n'est pas utilisé pour optimiser quotidiennement le système.

## Artefacts à conserver

Selon le projet, une expérience sérieuse doit pouvoir retrouver :

- le commit Git ;
- la version du dataset ;
- le schéma ;
- les transformations ;
- la version du modèle ;
- les paramètres ;
- le jeu d'évaluation ;
- les résultats ;
- les métriques ;
- les informations d'environnement pertinentes.

Tous les artefacts ne doivent pas nécessairement être stockés dans Git. L'objectif est de pouvoir retrouver leur identité et leur contenu de manière fiable.

## Erreurs fréquentes

- nommer des datasets `final.csv`, `final2.csv`, `final-final.csv` ;
- croire qu'un hash remplace la lineage ;
- utiliser le test pour choisir les paramètres ;
- oublier de versionner les transformations ;
- comparer deux scores sans vérifier que les jeux de données sont identiques.

## Exercices

- Construis le manifeste minimal d'un dataset d'évaluation.
- Deux runs ont le même commit mais des scores différents. Quelles dépendances compares-tu ?
- Explique pourquoi utiliser le même jeu de test pour chaque décision de tuning peut fausser l'évaluation.

:::indice
Cherche tout ce qui peut changer le résultat sans modifier le code.
:::

:::solution
Le manifeste peut contenir nom, version, source, hash, schéma et date. Compare dataset, modèle, paramètres, environnement, preprocessing et jeu d'évaluation. Si le test sert continuellement au tuning, les décisions s'adaptent à ce jeu et son score cesse d'être une mesure indépendante.
:::

## À retenir

En AI Engineering, la reproductibilité concerne le système expérimental complet. Le code est une pièce du puzzle ; données, modèles, paramètres et jeux d'évaluation doivent eux aussi être identifiables.

## Questions d'entretien

- Pourquoi un commit Git ne suffit-il pas à reproduire un entraînement ?
- À quoi sert un hash de dataset ?
- Pourquoi conserver un jeu de test indépendant ?

:::indice
Réponds avec un scénario concret de régression ou d'audit.
:::

:::reponse
Un commit ne fixe pas nécessairement les données, le modèle ou les paramètres. Le hash permet de vérifier l'identité et l'intégrité d'un contenu. Un test indépendant fournit une mesure moins contaminée par les décisions d'optimisation.
:::
