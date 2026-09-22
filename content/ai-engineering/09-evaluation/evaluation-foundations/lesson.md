---
id: ai-09-evaluation-foundations
title: "Fondamentaux de l'évaluation des systèmes IA"
slug: evaluation-foundations
technology: ai-engineering
level: advanced
module: evaluation
order: 1
estimatedMinutes: 85
difficulty: 5
xp: 190
prerequisites: [ai-08-multi-agent]
skills: [ai-evaluation]
tags: [evaluation, llm, quality, datasets, regression]
---

## Objectifs

- définir ce qu'une évaluation mesure réellement ;
- construire un jeu de cas représentatif et versionné ;
- séparer qualité, sécurité, coût et latence ;
- distinguer test unitaire, évaluation offline et mesure online ;
- interpréter une métrique sans confondre score et vérité.

## Introduction

Un système LLM ne se valide pas uniquement avec quelques réponses visuellement convaincantes. L'évaluation consiste à transformer des attentes produit et techniques en critères mesurables, puis à suivre ces critères sur un ensemble de cas représentatifs.

Une bonne évaluation doit répondre à une question précise : « dans quelles conditions ce système fonctionne-t-il, échoue-t-il et à quel coût ? ».

## Concept

### Qu'évalue-t-on ?

Il faut séparer plusieurs dimensions :

- **correctness** : la réponse satisfait-elle le résultat attendu ?
- **groundedness** : les affirmations sont-elles supportées par les sources disponibles ?
- **instruction following** : les contraintes demandées sont-elles respectées ?
- **safety** : le système refuse-t-il ou contrôle-t-il correctement les demandes dangereuses ?
- **tool correctness** : le bon outil est-il appelé avec les bons arguments ?
- **latence et coût** : le système reste-t-il dans les budgets définis ?

Un score global peut masquer une régression importante sur une dimension critique. Les dimensions doivent donc rester observables séparément.

### Dataset d'évaluation

Un dataset utile contient plus que des questions. Chaque cas devrait porter un identifiant stable, une entrée, des contraintes, un résultat attendu ou des critères d'acceptation, des métadonnées et éventuellement des références.

    type EvalCase = {
      id: string;
      input: string;
      expected?: string;
      criteria: string[];
      tags: string[];
      metadata: Record<string, string>;
    };

Les cas doivent être versionnés. Modifier un golden set sans tracer la modification rend les comparaisons historiques difficiles à interpréter.

### Golden set et cas difficiles

Un golden set contient des exemples sélectionnés et relus. Il doit inclure des cas normaux, limites, ambigus, adversariaux et historiquement échoués.

Un bon dataset n'est pas seulement grand : il représente les erreurs que le produit doit réellement éviter.

## Exemple

Pour un assistant de support, un cas peut demander :

> « Mon paiement est débité mais ma commande reste en attente. »

Les critères peuvent exiger :

1. identifier qu'il s'agit d'un problème de rapprochement ;
2. ne pas inventer de statut transactionnel ;
3. demander l'identifiant de commande si nécessaire ;
4. proposer une action autorisée ;
5. ne jamais exposer de données d'un autre client.

La même réponse peut être linguistiquement excellente mais échouer sur la sécurité ou l'exactitude métier.

## Comment ça fonctionne

### 1. Définir le contrat d'évaluation

Avant de choisir une métrique, définissez ce qui constitue un succès. Un critère doit être observable et suffisamment précis pour être appliqué de manière cohérente.

### 2. Construire des slices

Découpez les résultats par caractéristiques importantes : langue, longueur, domaine, type de demande, modèle, version de prompt, outil utilisé ou niveau de risque.

Une moyenne globale peut rester stable alors qu'une slice critique régresse fortement.

### 3. Exécuter un protocole reproductible

Conservez la version du modèle, du prompt, des outils, du dataset et de la configuration. Sans ces informations, un changement de score ne permet pas d'identifier la cause.

### 4. Comparer des versions

Comparez deux systèmes sur les mêmes cas lorsque c'est possible. Analysez ensuite les différences de réponses, pas seulement la moyenne.

Pour un indicateur de réussite binaire :

score = cas réussis / cas évalués

Pour une métrique moyenne :

mean = somme des scores / nombre de cas

Ces formules sont simples, mais leur interprétation dépend de la construction du dataset.

### 5. Analyser les erreurs

Chaque échec doit idéalement être catégorisé : hallucination, instruction non suivie, mauvais outil, source insuffisante, erreur métier, fuite de données, timeout ou dépassement de budget.

Cette taxonomie transforme l'évaluation en boucle d'amélioration plutôt qu'en simple tableau de scores.

## Erreurs fréquentes

- utiliser uniquement des exemples faciles ;
- modifier le dataset sans version ;
- publier uniquement une moyenne globale ;
- choisir une métrique parce qu'elle est facile à calculer ;
- comparer deux versions sur des cas différents ;
- traiter une sortie LLM comme une vérité de référence ;
- ignorer coût et latence ;
- ne pas conserver les traces nécessaires au diagnostic.

## Exercices

1. **Exercice 1 — Construire un golden set**

Vous devez évaluer un assistant de support financier. Définissez cinq catégories de cas et expliquez pourquoi chacune est nécessaire.

:::indice
Incluez des cas normaux mais aussi des cas limites, sensibles et historiquement problématiques.
:::

:::solution
Un ensemble utile peut couvrir demandes normales, ambiguës, erreurs métier, sécurité/confidentialité et cas adversariaux. On peut ajouter une catégorie dédiée aux régressions déjà observées.
:::

2. **Exercice 2 — Lire une régression**

Une nouvelle version passe de 88 % à 89 % globalement, mais une slice « paiements » passe de 95 % à 82 %. Que faut-il examiner ?

:::indice
La moyenne globale ne représente pas nécessairement le risque métier.
:::

:::solution
Il faut examiner la taille de la slice, les cas qui ont changé, leur criticité, la distribution des erreurs et les versions du modèle, prompt et outils. Une amélioration globale peut coexister avec une régression critique.
:::

3. **Exercice 3 — Définir un cas d'évaluation**

Écrivez les champs minimaux d'un cas permettant de comparer deux versions d'un agent.

:::indice
Pensez reproductibilité et diagnostic.
:::

:::solution
Un identifiant stable, l'entrée, les critères d'acceptation, les références éventuelles, les tags et les métadonnées de version sont nécessaires. Les traces d'exécution complètent le diagnostic.
:::

## À retenir

Une évaluation utile est un protocole reproductible, versionné et orienté vers les risques réels du produit. Les scores ne sont que des mesures : leur valeur dépend du dataset, des critères, des slices et du protocole utilisé.

Il faut suivre séparément qualité, sécurité, coût, latence et fiabilité afin de détecter les régressions qui seraient invisibles dans une moyenne globale.

## Questions d'entretien

1. **Pourquoi un golden set doit-il contenir des cas difficiles ?**

:::indice
Un dataset facile peut surestimer la qualité.
:::

:::reponse
Les cas difficiles exposent les frontières du système et les erreurs qui comptent en production. Ils permettent aussi de transformer des incidents historiques en tests de régression.
:::

2. **Pourquoi versionner le dataset d'évaluation ?**

:::indice
Imaginez que le score change après modification du dataset.
:::

:::reponse
Sans version, il devient difficile de savoir si une variation vient du système évalué ou du changement de population de test. Le versionnage rend les comparaisons historiques interprétables.
:::

3. **Pourquoi segmenter les résultats en slices ?**

:::indice
Une moyenne peut cacher une sous-population critique.
:::

:::reponse
Les slices permettent de détecter des régressions ciblées par domaine, langue, risque ou type de tâche que la moyenne globale peut masquer.
:::
