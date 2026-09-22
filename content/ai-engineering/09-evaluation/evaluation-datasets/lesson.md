---
id: ai-09-datasets
title: "Datasets d'évaluation et golden sets"
slug: evaluation-datasets
technology: ai-engineering
level: advanced
module: evaluation
order: 2
estimatedMinutes: 90
difficulty: 5
xp: 200
prerequisites: [ai-09-evaluation-foundations]
skills: [ai-evaluation]
tags: [evaluation, datasets, golden-set, annotation, sampling, leakage]
---

## Objectifs

- construire un dataset d'évaluation représentatif ;
- distinguer génération, sélection et annotation de cas ;
- gérer les labels ambigus et les désaccords ;
- éviter fuite de données et contamination ;
- versionner les datasets et leur provenance.

## Introduction

La qualité d'une évaluation dépend directement de la qualité de ses cas. Un système peut obtenir un excellent score sur un dataset mal construit tout en échouant sur les situations importantes en production.

Un golden set est donc un actif d'ingénierie : il doit être conçu, relu, versionné et maintenu comme du code critique.

## Concept

### Population et échantillonnage

Commencez par définir la population sur laquelle le système sera utilisé. Le dataset doit ensuite couvrir les dimensions qui influencent le comportement : langue, domaine, longueur, difficulté, type de tâche, canal, version du produit et niveau de risque.

Un échantillonnage uniforme n'est pas toujours approprié. Les événements rares mais critiques peuvent nécessiter une surreprésentation contrôlée dans l'évaluation, tout en conservant leur fréquence réelle dans les analyses séparées.

### Types de cas

Un dataset robuste mélange :

- cas représentatifs du trafic réel ;
- cas limites ;
- cas adversariaux ;
- cas issus d'incidents ;
- cas synthétiques relus par un humain ;
- cas de non-régression.

Chaque type a une fonction différente. Un cas synthétique peut élargir la couverture, mais ne doit pas être considéré automatiquement comme équivalent à un exemple réel annoté.

### Annotation

Un label doit être accompagné d'une définition opérationnelle. Pour un critère subjectif, utilisez une rubrique explicite avec des exemples positifs et négatifs.

Pour plusieurs annotateurs, mesurez les désaccords. Un désaccord systématique peut révéler un critère ambigu plutôt qu'un annotateur défaillant.

### Provenance

Conservez l'origine du cas, sa date, sa version, son annotateur ou sa méthode de génération, ainsi que les transformations appliquées.

La provenance permet de répondre à : « pourquoi ce cas est-il dans le golden set et peut-on légalement ou techniquement le réutiliser ? ».

## Exemple

Pour un assistant bancaire, construisez des slices :

- demandes de solde ;
- problèmes de paiement ;
- remboursements ;
- fraude suspectée ;
- demandes contenant des données personnelles ;
- demandes ambiguës ;
- langues supportées.

Ajoutez ensuite des cas provenant d'incidents réels anonymisés et des cas adversariaux contrôlés.

Un cas peut porter :

    id: pay-042
    slice: payment
    risk: high
    source: incident
    expected_criteria:
      - no_unsupported_transaction_status
      - request_missing_identifier

Le résultat attendu n'est pas nécessairement une phrase exacte. Pour une application réelle, des critères structurés peuvent être plus robustes qu'une comparaison textuelle.

## Comment ça fonctionne

### 1. Définir la matrice de couverture

Listez les dimensions pertinentes et fixez une cible de couverture. Par exemple : tâche × risque × langue × longueur.

La matrice permet d'identifier les zones sans exemples avant de lancer l'évaluation.

### 2. Séparer trafic et golden set

Le golden set doit rester stable assez longtemps pour permettre les comparaisons. Le trafic réel peut évoluer indépendamment.

Conservez donc au minimum deux populations :

- une population représentative pour estimer la performance réelle ;
- une population curated pour tester les frontières et les régressions.

### 3. Annoter avec une rubrique

Pour chaque critère, définissez ce qui constitue un passage, un échec et un cas indéterminé.

Un troisième état est important : forcer une décision binaire sur un exemple réellement ambigu peut injecter du bruit dans les labels.

### 4. Contrôler la contamination

Recherchez les cas qui ont servi à l'entraînement, au fine-tuning, au prompt engineering ou à la sélection manuelle d'un système.

Un benchmark dont les réponses sont mémorisées ne mesure pas correctement la capacité de généralisation.

### 5. Versionner

Un identifiant de dataset doit pointer vers une version immuable. Toute modification significative produit une nouvelle version et un changelog.

Les rapports doivent conserver la version exacte du dataset utilisée.

## Erreurs fréquentes

- créer uniquement des cas inventés par l'équipe ;
- utiliser seulement des cas faciles ;
- mélanger dataset de développement et dataset final ;
- changer les labels sans version ;
- ignorer les désaccords d'annotation ;
- exposer des données personnelles dans les évaluations ;
- contaminer le test avec des exemples utilisés pour optimiser le système ;
- comparer des scores issus de populations différentes sans le signaler.

## Exercices

1. **Exercice 1 — Matrice de couverture**

Concevez une matrice pour un chatbot support couvrant quatre tâches, trois niveaux de risque et deux langues.

:::indice
Commencez par les dimensions puis définissez comment détecter les cellules sous-représentées.
:::

:::solution
Une matrice tâche × risque × langue permet de vérifier la couverture. Chaque cellule doit avoir un nombre minimal de cas, avec une stratégie spécifique pour les cellules rares ou critiques.
:::

2. **Exercice 2 — Désaccord d'annotation**

Deux annotateurs classent régulièrement différemment les réponses d'un assistant. Que faut-il faire avant de conclure que le modèle est mauvais ?

:::indice
Le problème peut venir du contrat d'annotation.
:::

:::solution
Comparer les cas litigieux, clarifier la rubrique, ajouter des exemples positifs/négatifs et mesurer l'accord après recalibration. Certains cas peuvent rester indéterminés.
:::

3. **Exercice 3 — Contamination**

Un modèle obtient 100 % sur un benchmark dont les réponses circulent publiquement depuis longtemps. Quelles conclusions pouvez-vous tirer ?

:::indice
Pensez mémorisation versus généralisation.
:::

:::solution
Le score ne permet pas à lui seul de conclure à une capacité de généralisation. Il faut examiner la provenance, la contamination potentielle et compléter avec des cas nouveaux ou tenus secrets.
:::

## À retenir

Un bon dataset d'évaluation est représentatif, intentionnellement difficile, versionné et traçable. Il distingue les cas de trafic réel, les golden cases, les incidents et les cas adversariaux.

L'annotation est elle-même un problème d'ingénierie : les rubriques, la provenance et les désaccords doivent être observables.

## Questions d'entretien

1. **Pourquoi séparer dataset de développement et golden set ?**

:::indice
L'optimisation répétée peut rendre un dataset trop facile.
:::

:::reponse
Le dataset de développement sert à itérer. Le golden set doit rester protégé pour fournir une mesure moins biaisée de la performance finale et des régressions.
:::

2. **Pourquoi un cas "indéterminé" peut-il être utile ?**

:::indice
Tous les exemples ne permettent pas une décision binaire fiable.
:::

:::reponse
Forcer un label lorsque les critères sont réellement insuffisants ajoute du bruit. Un état indéterminé permet d'isoler les cas nécessitant une clarification.
:::

3. **Comment détecter une contamination ?**

:::indice
Examinez la provenance et l'historique du système.
:::

:::reponse
Il faut rechercher si les cas ou leurs réponses ont été présents dans les données d'entraînement, le fine-tuning, les prompts ou les étapes d'optimisation. Des cas nouveaux et contrôlés complètent ce contrôle.
:::
