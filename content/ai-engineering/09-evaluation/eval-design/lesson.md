---
id: ai-09-eval-design
title: "Concevoir un système d'évaluation"
slug: eval-design
technology: ai-engineering
level: advanced
module: 09-evaluation
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

## À retenir
Une évaluation utile permet de comparer deux versions sans dépendre d'une impression ponctuelle.
