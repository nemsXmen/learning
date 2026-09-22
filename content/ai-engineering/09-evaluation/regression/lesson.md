---
id: ai-09-regression
title: "Tests de régression et observabilité qualité"
slug: regression
technology: ai-engineering
level: advanced
module: evaluation
order: 4
estimatedMinutes: 70
difficulty: 5
xp: 170
prerequisites: [ai-09-quality-cost]
skills: [ai-evaluation]
tags: [evaluation, metrics, llm]
---

## Objectifs
- détecter les régressions ;
- versionner datasets et prompts ;
- analyser les erreurs par catégorie ;
- définir des seuils de déploiement.

## Golden set
Conserve un ensemble fixe de cas représentatifs. Chaque changement important l'exécute automatiquement.

```text
commit -> eval suite -> compare baseline -> gate deployment
```

## Analyse
Ne regarde pas uniquement le score global. Segmente par langue, intention, difficulté, tenant, longueur et type d'erreur.

## Release gate
Un changement peut être bloqué si une métrique critique baisse au-delà d'un seuil défini.

## Exercices
- Le score global est trompeur lorsqu'une population importante masque une petite population critique. Segmente par langue, intention, difficulté, longueur ou catégorie de risque.

:::indice
- Le score global reste stable mais les requêtes en français régressent. Que montre la moyenne ?
:::
:::solution
Cherche ce que l'agrégation peut masquer.
:::
## Erreurs fréquentes

Le flow est : changement → suite d'évaluation → comparaison → analyse par segment → release gate → déploiement. Une gate peut bloquer une release si une métrique critique descend sous un seuil défini.

## À retenir

Elle peut cacher une régression importante sur un sous-groupe. Il faut analyser les résultats par segment avant de valider la release.

## Introduction

Transformer l'évaluation en garde-fou de release

## Concept

Une amélioration locale peut casser un comportement existant. Une suite de régression transforme donc les évaluations en protection continue du produit.

## Exemple

Le golden set reste fixe pour permettre la comparaison. Il doit néanmoins évoluer lorsque de nouveaux cas importants apparaissent ; ces changements doivent être versionnés afin de distinguer une modification du système d'une modification du test.

## Comment ça fonctionne

Après chaque changement de modèle, prompt, chunking ou outil, la suite rejoue les cas critiques et compare la nouvelle version à une baseline.

## Questions d'entretien
- La qualité devient une propriété versionnée du logiciel lorsqu'elle est testée automatiquement avant les releases.

:::indice
Relie ta réponse à une décision concrète de qualité, coût ou release.
:::
:::reponse
Que doit faire une release gate ?
:::