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
