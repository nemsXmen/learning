---
id: ai-09-evaluation-regression
title: "Regression suites & CI"
slug: regression
technology: ai-engineering
level: intermediate
module: 09-evaluation
order: 1
estimatedMinutes: 45
difficulty: 3
xp: 120
prerequisites: []
skills:
  - ai-evaluation
tags: [ai, security, evaluation]
---

## Objectifs
- Comprendre Regression suites & CI.
- Construire des contrôles reproductibles.
- Réduire les régressions et les risques.

## Concept
Un système AI doit être traité comme un système logiciel soumis à des entrées adversariales, des changements de données et des dépendances externes. **Regression suites & CI** permet de transformer un risque ou un objectif de qualité en contrôle observable.

Commence par identifier actifs, entrées non fiables, frontières de confiance, actions possibles et conséquences d'un échec. Ensuite, définis des tests qui peuvent être exécutés automatiquement lorsque c'est possible.

## Méthode
1. Lister actifs et données sensibles.
2. Identifier les frontières de confiance.
3. Définir les comportements attendus.
4. Ajouter des cas normaux, limites et adverses.
5. Exécuter les contrôles dans CI.
6. Bloquer le déploiement lorsque les seuils critiques sont dépassés.

## Erreurs fréquentes
- Considérer le modèle comme une frontière de sécurité.
- Tester uniquement des réponses normales.
- Stocker des secrets dans prompts ou logs.
- Utiliser une métrique globale qui masque les échecs critiques.
- Dépendre d'un test manuel impossible à reproduire.

## Exercice
Écris une mini threat model et une suite de dix tests pour **Regression suites & CI**. Pour chaque test, précise entrée, comportement attendu et conséquence d'un échec.

:::indice
Commence par ce qui peut réellement être perdu : données, argent, accès, réputation ou disponibilité.
:::

:::solution
Une solution utile identifie les actifs, les frontières de confiance et les scénarios d'abus, puis transforme les scénarios prioritaires en contrôles automatisables.
:::

## À retenir
- La sécurité AI commence par les frontières de confiance.
- Les tests adverses doivent être versionnés comme les tests fonctionnels.
- Les secrets et données sensibles ne doivent pas devenir des entrées implicites du système.
