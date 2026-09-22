---
id: ai-13-analytics
title: "Analytics, feedback et boucle d'amélioration"
slug: analytics
technology: ai-engineering
level: advanced
module: 13-product
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
Les utilisateurs génèrent beaucoup mais valident rarement les résultats. Quelle hypothèse tester ?

:::indice
Relie chaque décision technique à une métrique ou un risque utilisateur concret.
:::

:::solution
Mesurer qualité perçue, taux de correction, temps gagné et raisons d'abandon plutôt que compter uniquement les générations.

:::

## Erreurs fréquentes

- choisir une technologie avant de définir le problème ;
- mesurer une moyenne sans regarder les cas critiques ;
- confondre une sortie plausible avec une sortie validée ;
- oublier coût, sécurité et opérations dans la conception.

## À retenir
L'analytics IA doit relier usage, qualité et outcome métier.


## Introduction

L'analytics AI mesure adoption, qualité et outcome métier.

## Concept

Activation, task completion, acceptance, correction, fallback et coût par tâche sont complémentaires.

## Exemple

Un volume élevé de générations peut cacher un faible taux d'acceptation.

## Comment ça fonctionne

activation → task → AI result → accepted/edited → outcome

## Questions d'entretien

- Pourquoi ne pas utiliser seulement le nombre de générations ?

  :::indice
  Relie la métrique à une décision produit concrète.
  :::

  :::reponse
  Parce qu'une génération n'est pas nécessairement une valeur créée.
  :::
