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

## Exercice
Les utilisateurs génèrent beaucoup mais valident rarement les résultats. Quelle hypothèse tester ?

### Solution
Mesurer qualité perçue, taux de correction, temps gagné et raisons d'abandon plutôt que compter uniquement les générations.

## À retenir
L'analytics IA doit relier usage, qualité et outcome métier.
