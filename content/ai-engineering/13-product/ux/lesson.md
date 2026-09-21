---
id: ai-13-product-ux
title: "AI UX & human control"
slug: ux
technology: ai-engineering
level: advanced
module: 13-product
order: 1
estimatedMinutes: 50
difficulty: 4
xp: 140
prerequisites: []
skills:
  - ai-product
tags: [ai, product, advanced]
---

## Objectifs
- Comprendre AI UX & human control.
- Choisir une approche proportionnée au problème.
- Construire des critères de succès mesurables.

## Concept
Une fonctionnalité AI doit résoudre un problème utilisateur, pas simplement exposer un modèle. **AI UX & human control** doit être relié à un contrat produit : qui utilise la fonctionnalité, quelle décision elle aide, quel niveau d'erreur est acceptable et quelle action humaine reste possible.

Les techniques avancées ne doivent être introduites qu'après une baseline. Fine-tuning, adaptation efficace ou compression ajoutent des coûts de données, calcul et maintenance ; leur intérêt doit être démontré par une mesure.

## Méthode
1. Définir le problème utilisateur.
2. Établir une baseline.
3. Définir les métriques produit et techniques.
4. Tester sur des cas réels représentatifs.
5. Mesurer l'effet de la modification.
6. Documenter les limites et le rollback.

## Erreurs fréquentes
- Construire une démo sans critère de succès.
- Remplacer l'humain dans une décision sensible sans garde-fou.
- Fine-tuner avant d'avoir établi une baseline.
- Optimiser un benchmark sans bénéfice produit.
- Oublier la maintenance d'un artefact spécialisé.

## Exercice
Écris une fiche produit pour **AI UX & human control** : utilisateur cible, problème, baseline, métriques, risques, contrôle humain et critères de lancement.

:::indice
Une fonctionnalité AI réussie améliore une tâche mesurable ; elle n'a pas besoin d'utiliser la technique la plus complexe.
:::

:::solution
La fiche doit relier besoin, métriques et risques. Elle doit également expliquer pourquoi l'approche choisie est préférable à une baseline plus simple.
:::

## À retenir
- Produit et modèle doivent être évalués ensemble.
- Les techniques avancées ont un coût de maintenance.
- L'humain doit rester dans la boucle lorsque le risque le justifie.
