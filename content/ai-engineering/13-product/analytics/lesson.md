---
id: ai-13-analytics
title: "Analytics, feedback et boucle d'amélioration"
slug: analytics
technology: ai-engineering
level: advanced
module: product
order: 4
estimatedMinutes: 75
difficulty: 4
xp: 160
prerequisites: [ai-13-ux]
skills: [ai-product]
tags: [product, ux, analytics, ai]
---

## Objectifs
- mesurer adoption et succès ;
- recueillir feedback explicite ;
- relier qualité et comportement ;
- éviter les métriques trompeuses.

## Funnel
```text
activation -> task started -> AI result -> accepted -> outcome
```

Ne confonds pas nombre de générations et valeur créée.

## Feedback
Combine signaux explicites, erreurs, corrections et résultats métier. Anonymise ou minimise les données observées selon le besoin.

## Expérimentation
Versionne prompt, modèle et configuration. Compare des cohortes comparables et définis les métriques avant l'expérience.

## Exercices
- Les cohortes doivent être comparables et les métriques définies avant l'expérience. Minimise aussi les données collectées dans les événements analytics.

:::indice
Les utilisateurs génèrent beaucoup mais valident rarement les résultats. Quelle hypothèse tester ?
::

:::solution
Observe ce qui arrive après la génération.
::
## Erreurs fréquentes

Le flow est : activation → task → AI result → accepted/edited → outcome. Versionne modèle, prompt et configuration afin de relier une évolution du produit à ses effets.

## À retenir

Mesurer qualité perçue, taux de correction, temps gagné et raisons d'abandon plutôt que compter uniquement les générations.

## Introduction

Mesurer l'usage jusqu'à l'outcome

## Concept

L'analytics d'un produit AI doit relier comportement, qualité et résultat. Compter les appels au modèle mesure une activité technique, pas nécessairement une valeur produit.

## Exemple

Un funnel utile peut suivre activation, tâche commencée, résultat AI, acceptation ou édition, puis outcome. Les signaux explicites doivent être complétés par corrections, erreurs, abandons et résultats métier.

## Comment ça fonctionne

Si les utilisateurs génèrent beaucoup mais valident rarement, le problème peut venir de la qualité, du workflow ou du manque de confiance. Il faut mesurer le taux d'acceptation et de correction plutôt que conclure à partir du volume.

## Questions d'entretien
- L'analytics AI doit relier usage, qualité et outcome métier.

:::indice
Relie ta réponse à une décision produit mesurable.
::

:::reponse
Pourquoi ne pas utiliser seulement le nombre de générations ?
::