---
id: ai-09-llm-as-judge
title: "LLM-as-a-Judge : évaluer avec un modèle"
slug: llm-as-judge
technology: ai-engineering
level: advanced
module: evaluation
order: 6
estimatedMinutes: 90
difficulty: 5
xp: 210
prerequisites: [ai-09-metrics]
skills: [ai-evaluation]
tags: [evaluation, llm-as-judge, rubric, bias, calibration]
---

## Objectifs

- comprendre quand utiliser un LLM comme évaluateur ;
- construire une rubrique explicite et reproductible ;
- séparer jugement, agrégation et décision ;
- détecter les biais d’un judge ;
- calibrer un judge contre des annotations humaines ;
- éviter de transformer le judge en source unique de vérité.

## Introduction

Certaines propriétés d’une réponse sont difficiles à mesurer avec une règle déterministe : qualité d’une explication, couverture, respect d’une consigne complexe ou utilité d’une réponse.

Un LLM-as-a-Judge peut alors produire un jugement structuré. Mais le judge est lui-même un système probabiliste : il doit être évalué, versionné et surveillé comme n’importe quel composant d’évaluation.

## Concept

### Le contrat de jugement

Un bon judge ne reçoit pas seulement « note cette réponse de 1 à 5 ».

Le contrat doit définir :
- le contexte nécessaire ;
- le critère évalué ;
- les niveaux de la rubrique ;
- les preuves attendues ;
- le format de sortie ;
- la gestion des cas indéterminés.

Exemple de sortie structurée :

~~~json
{
  "score": 0,
  "pass": true,
  "evidence": ["..."],
  "reason": "...",
  "uncertain": false
}
~~~

La sortie structurée facilite validation, agrégation et analyse des désaccords.

### Rubrique plutôt que préférence

Une rubrique doit décrire des comportements observables.

| Score | Critère |
| --- | --- |
| 0 | affirme des informations contredites ou inventées |
| 1 | plusieurs affirmations non supportées |
| 2 | globalement supporté mais avec omissions importantes |
| 3 | supporté avec quelques imprécisions mineures |
| 4 | affirmations supportées et limites correctement signalées |

La rubrique réduit l’ambiguïté, mais ne supprime pas le biais du judge.

### Pointwise et pairwise

Un judge peut attribuer une note à une réponse, comparer deux réponses ou classer plusieurs réponses.

Le pairwise est utile pour comparer deux versions, mais l’ordre de présentation peut influencer le résultat. Randomiser la position A/B et mesurer l’effet d’ordre permet de détecter ce biais.

### Validation contre des humains

Avant d’utiliser un judge comme gate de release, comparez-le à un échantillon annoté par des humains.

Mesurez notamment :
- taux d’accord ;
- désaccords par catégorie ;
- faux positifs et faux négatifs de la décision pass/fail ;
- stabilité sur répétition ;
- sensibilité à la longueur et au style.

Un taux d’accord global élevé peut cacher un désaccord important sur les cas à haut risque.

### Biais courants

Un judge peut favoriser les réponses longues, une formulation particulière, son propre modèle ou sa propre famille de modèles, une réponse placée en première position ou certaines langues.

Il faut donc tester ces dimensions séparément.

## Exemple

Pour comparer deux versions d’un assistant, utilisez la même entrée, les mêmes références et une rubrique identique.

~~~text
input
 ├── version A ──┐
 │               ├── judge ──> score + evidence
 └── version B ──┘
~~~

Le pipeline conserve ensuite : version du judge, version de la rubrique, prompt du judge, modèle évalué, entrée et contexte, décision et raison structurée.

## Comment ça fonctionne

### 1. Définir la propriété

Commencez par une propriété observable : exactitude, couverture, conformité, style, helpfulness ou groundedness.

### 2. Écrire la rubrique

Définissez des niveaux avec des critères suffisamment concrets pour limiter l’interprétation.

### 3. Produire un jugement structuré

Imposez un schéma validable. Refusez ou rejouez les sorties invalides plutôt que de parser une phrase libre.

### 4. Calibrer

Conservez un échantillon humain de référence. Comparez les décisions du judge avec celles des annotateurs et inspectez les désaccords.

### 5. Tester la robustesse

Répétez le jugement sur des permutations contrôlées : ordre A/B, longueur, formulation, langue et informations non pertinentes.

### 6. Utiliser le judge comme un signal

Combinez le judge avec des assertions déterministes, métriques classiques, contrôles de sécurité et revue humaine lorsque le risque le justifie.

## Erreurs fréquentes

- demander une note sans rubrique ;
- considérer le score du judge comme une vérité ;
- ignorer le biais de position ;
- comparer deux versions avec des prompts de judge différents ;
- ne pas versionner le prompt et la rubrique ;
- utiliser un judge non calibré comme release gate ;
- masquer les cas indéterminés dans la moyenne ;
- mesurer uniquement l’accord global ;
- oublier le coût et la latence du judge.

## Exercices

1. **Construire une rubrique**

Vous devez évaluer la fidélité d’un assistant RAG sur une échelle de 0 à 4. Définissez les critères des niveaux.

:::indice
Décrivez des comportements observables et la relation aux sources.
:::
:::solution
Les niveaux doivent aller de l’absence de support ou de contradictions jusqu’à une réponse entièrement supportée, avec les niveaux intermédiaires décrivant omissions et imprécisions.
:::

2. **Détecter un biais de position**

Un judge préfère systématiquement la réponse A lorsque A est affichée en premier. Comment vérifier l’hypothèse ?

:::indice
Inversez l’ordre sans modifier les réponses.
:::
:::solution
Exécutez A/B puis B/A sur les mêmes cas et comparez les décisions. Une variation systématique indique un biais de position.
:::

3. **Décider si un judge peut bloquer une release**

Un judge affiche 95 % d’accord global avec les humains mais seulement 72 % sur les cas à haut risque. Peut-il être utilisé seul comme gate ?

:::indice
Le segment critique compte davantage que la moyenne globale.
:::
:::solution
Il faut traiter séparément les cas à haut risque. L’accord global masque une faiblesse sur la population critique ; le judge doit être complété ou limité avant de devenir une gate unique.
:::

## À retenir

LLM-as-a-Judge est une technique d’évaluation, pas une autorité absolue.

Un judge sérieux possède une rubrique versionnée, une sortie structurée, une calibration humaine, des tests de biais et un protocole reproductible. Les décisions critiques doivent combiner plusieurs signaux adaptés au risque.

## Questions d’entretien

1. **Pourquoi calibrer un LLM-as-a-Judge ?**

:::indice
Le judge peut se tromper lui aussi.
:::
:::reponse
La calibration permet de mesurer son accord avec des annotations humaines et d’identifier les catégories ou populations où il est moins fiable.
:::

2. **Pourquoi tester le biais de position ?**

:::indice
Comparez A/B et B/A.
:::
:::reponse
Un judge peut favoriser la première réponse présentée. Permuter l’ordre permet de mesurer cet effet.
:::

3. **Pourquoi ne pas utiliser un judge seul ?**

:::indice
Certaines propriétés sont mesurables sans modèle.
:::
:::reponse
Les assertions déterministes, métriques classiques, contrôles de sécurité et revues humaines fournissent des signaux complémentaires. Un judge peut introduire ses propres biais et erreurs.
:::
