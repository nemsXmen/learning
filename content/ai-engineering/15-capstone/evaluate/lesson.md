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
- créer un golden dataset ;
- mesurer plusieurs dimensions ;
- tester les régressions ;
- intégrer la sécurité aux évaluations.

## Golden dataset
Construis des cas représentatifs : succès, ambiguïté, données manquantes, adversarial, longues entrées et erreurs d'outils.

```text
input -> system -> retrieval -> generation -> tools -> final
                 |                 |
              metrics           traces
```

Mesure qualité, groundedness, exactitude structurée, latence, coût et taux d'erreur.

## Release gate
Une version ne doit pas seulement « sembler meilleure ». Elle doit respecter des seuils définis sur les métriques critiques et ne pas introduire de régression de sécurité.

## Exercice
Une nouvelle version améliore la qualité moyenne mais échoue davantage sur les requêtes sensibles. Que montre l'évaluation ?

:::indice
Décompose le système en responsabilités et vérifie chaque frontière avant le lancement.
:::

:::solution
La moyenne masque une régression sur un segment critique. Il faut segmenter les résultats et bloquer la release si le seuil de sécurité est dépassé.

:::

## Erreurs fréquentes

- mélanger responsabilités métier, modèle et autorisation ;
- lancer sans golden dataset ni observabilité ;
- ignorer coûts et quotas ;
- ne pas préparer rollback et runbook.

## À retenir
L'évaluation doit représenter les vrais risques du produit, pas seulement sa moyenne.


## Introduction

L'évaluation finale doit couvrir qualité, coût, latence et sécurité.

## Concept

Golden dataset, tests d'intégration et critères de release rendent le capstone mesurable.

## Exemple

Une régression sur une catégorie sensible doit rester visible même si la moyenne générale augmente.

## Comment ça fonctionne

cases → system run → metrics → segmented analysis → release gate

## Questions d'entretien

- Pourquoi segmenter le golden dataset ?

  :::indice
  Pense à la responsabilité de chaque couche et au contrôle des risques.
  :::

  :::reponse
  Pour révéler les régressions masquées par une moyenne globale.
  :::
