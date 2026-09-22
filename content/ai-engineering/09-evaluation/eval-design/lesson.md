---
id: ai-09-eval-design
title: "Concevoir un système d'évaluation"
slug: eval-design
technology: ai-engineering
level: advanced
module: evaluation
order: 1
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-08-tools-security]
skills: [ai-evaluation]
tags: [evaluation, metrics, llm]
---

## Objectifs
- définir des critères mesurables ;
- construire des cas représentatifs ;
- séparer tests déterministes et évaluations LLM ;
- analyser les erreurs.

## Evaluation-driven development
Avant d'améliorer un prompt ou un modèle, définis ce que signifie « correct ». Le dataset doit couvrir happy paths, limites, refus et adversarial cases.

```text
dataset -> runner -> system version -> metrics -> error analysis
```

## Rubrique
Pour une réponse libre, une grille explicite peut évaluer exactitude, couverture, conformité et style. Pour un JSON, privilégie d'abord des assertions déterministes.

## Exercices
- Une métrique peut être excellente tout en mesurant la mauvaise chose. Il faut donc relier chaque critère à un risque ou une décision produit et conserver les versions du dataset et des règles d'évaluation.

:::indice
- Construis un golden set de 20 cas pour une fonctionnalité de résumé.
::

:::solution
Couvre cas normaux, limites, refus et documents variés.
::
## Erreurs fréquentes

Le flow est : dataset versionné → runner → version du système → métriques → analyse d'erreurs → décision. Utilise des assertions déterministes lorsqu'elles existent, puis un judge ou une grille humaine pour les propriétés plus ouvertes.

## À retenir

Versionner les entrées et attentes, définir des assertions déterministes quand possible et une grille explicite pour exactitude, couverture et conformité sur le reste.

## Introduction

Évaluer avant d'optimiser

## Concept

Une application AI ne peut pas être améliorée sérieusement si personne n'a défini ce que « correct » signifie. L'évaluation transforme une impression subjective en critères comparables.

## Exemple

Commence par un golden set représentatif : cas normaux, limites, refus, adversariaux et sorties structurées. Chaque cas doit avoir une attente ou une rubrique permettant de décider si le résultat est acceptable.

## Comment ça fonctionne

Pour une fonctionnalité de résumé, vingt exemples peuvent couvrir plusieurs longueurs de documents, des informations critiques et des cas où le système doit signaler une information absente plutôt que l'inventer.

## Questions d'entretien
- Une bonne évaluation permet de comparer deux versions sans dépendre d'une impression ponctuelle.

:::indice
Relie ta réponse à une décision concrète de qualité, coût ou release.
::

:::reponse
Pourquoi versionner le dataset d'évaluation ?
::