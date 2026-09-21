---
id: ai-09-regression
title: "Tests de régression et observabilité qualité"
slug: regression
technology: ai-engineering
level: advanced
module: 09-evaluation
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

## Exercice
Le score global reste stable mais les requêtes en français régressent. Que montre une métrique agrégée ?

### Solution
Elle peut masquer une régression sur un sous-groupe. Il faut segmenter les résultats.

## À retenir
La qualité doit être testée comme une propriété versionnée du logiciel.


## Introduction

Une suite de régression empêche une amélioration locale de casser un comportement existant.

## Concept

Golden cases, seuils et comparaison de versions constituent une release gate.

## Exemple

Après changement de prompt, rejouer automatiquement les cas critiques révèle les régressions avant production.

## Comment ça fonctionne

change → eval suite → compare → gate → release

## Questions d'entretien

- Que doit faire une release gate ?

  :::indice
  Une bonne métrique doit être reliée à une décision.
  :::

  :::reponse
  Bloquer ou signaler une version lorsque des seuils critiques sont dépassés.
  :::
