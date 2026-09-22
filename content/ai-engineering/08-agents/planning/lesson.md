---
id: ai-08-planning
title: "Planification et exécution contrôlée"
slug: planning
technology: ai-engineering
level: advanced
module: agents
order: 4
estimatedMinutes: 80
difficulty: 5
xp: 180
prerequisites: [ai-08-tool-use]
skills: [ai-agents]
tags: [agents, planning, orchestration, reliability]
---

## Objectifs
- distinguer planification et exécution ;
- choisir entre boucle simple et plan explicite ;
- rendre les étapes observables et reprenables ;
- éviter les plans trop longs ou inutiles.


## Introduction

La planification transforme un objectif complexe en une suite d'étapes exécutables et vérifiables. Elle sert surtout lorsque les dépendances, les décisions intermédiaires ou les reprises deviennent difficiles à gérer dans une simple boucle agentique.

## Concept

Un plan est une représentation intermédiaire entre l'intention utilisateur et l'exécution. Chaque étape doit préciser son entrée, sa sortie attendue, ses dépendances et ses limites. Le plan n'accorde aucune permission : le runtime conserve le contrôle des outils et des effets de bord.

## Exemple

Pour produire un rapport financier, l'agent peut planifier : récupérer les données → vérifier leur fraîcheur → calculer les agrégats → générer le rapport → contrôler le résultat → publier. Si une vérification échoue, l'exécution s'arrête ou replanifie au lieu de poursuivre aveuglément.

## Comment ça fonctionne

Le runtime charge l'objectif, produit ou reçoit un plan, valide ses étapes, exécute uniquement les actions autorisées, observe les résultats puis décide de poursuivre, reprendre, replanifier ou arrêter. Les budgets, timeouts et conditions de fin sont appliqués indépendamment du modèle.

## Pourquoi planifier

Une tâche complexe peut être décomposée en étapes dépendantes. La planification donne une représentation intermédiaire avant l'exécution des actions.

```text
objectif
  -> plan
  -> étape 1
  -> observation
  -> étape 2
  -> observation
  -> résultat
```

La planification n'est pas obligatoire pour toutes les tâches. Une question simple peut être traitée par une boucle directe sans produire un plan détaillé.

## Plan statique vs plan adaptatif

Un plan statique est produit avant l'exécution. Il est simple à auditer mais devient fragile si l'environnement change.

Un plan adaptatif réévalue les prochaines étapes après chaque observation. Il est plus flexible mais augmente le coût, la latence et la surface d'erreur.

Le runtime doit donc définir quand une nouvelle planification est nécessaire.

## Décomposer une tâche

Une bonne étape doit avoir :

- une entrée clairement définie ;
- une sortie vérifiable ;
- des outils autorisés ;
- une condition d'échec ;
- un budget ;
- une condition de fin.

Évite les étapes vagues comme « fais tout le nécessaire ».

## Dépendances

Représente les dépendances explicitement.

```text
A: récupérer les données
B: analyser A
C: générer le rapport à partir de B
D: notifier après C
```

B dépend de A, C dépend de B et D dépend de C. Une étape indépendante peut éventuellement être exécutée en parallèle, mais seulement si ses effets et ses ressources sont compatibles.

## Vérification des étapes

Après une action importante, vérifie son résultat avant de continuer.

```text
action -> résultat -> validation -> prochaine étape
```

Ne considère pas l'absence d'erreur technique comme la preuve que le résultat métier est correct.

## Reprise

Un workflow de production doit pouvoir reprendre après une panne. Persiste les étapes utiles, les identifiants de corrélation et les résultats nécessaires.

Une reprise doit être conçue avec l'idempotence des outils : rejouer une étape ne doit pas créer un effet de bord inattendu.

## Human-in-the-loop

Pour les actions à fort impact, l'agent peut préparer une proposition sans l'exécuter automatiquement.

Exemple :

```text
agent -> prépare remboursement
      -> vérification métier
      -> confirmation humaine
      -> mutation
```

Le niveau de contrôle dépend du risque de l'action.

## Limiter la planification

Un agent peut perdre du temps à planifier une tâche triviale ou produire un plan énorme impossible à maintenir.

Utilise des budgets sur :

- nombre d'étapes ;
- profondeur de décomposition ;
- temps ;
- appels modèle ;
- appels outils.

Si le budget est dépassé, arrête ou reviens à une stratégie plus simple.

## Exercices

- Un agent doit traiter 1 000 factures et produire un rapport. Pourquoi un plan contenant 1 000 étapes explicites est-il une mauvaise abstraction ?
:::indice
Compare la taille du plan à la taille de la tâche et cherche ce qui peut être généralisé.
:::
:::solution
Le plan doit décrire les étapes et les règles de traitement, pas matérialiser chaque élément. Un worker borné ou une boucle contrôlée peut traiter les factures par lots avec observabilité et reprise.
:::

- Une étape de paiement retourne un timeout. Quelle information faut-il connaître avant de la rejouer ?
:::indice
Le timeout ne prouve pas que le paiement n'a pas été exécuté.
:::
:::solution
Il faut vérifier l'état réel de la mutation et utiliser l'identifiant ou la clé d'idempotence permettant de reprendre sans créer un second paiement.
:::

## Erreurs fréquentes

- planifier systématiquement même les tâches simples ;
- produire des étapes sans sortie vérifiable ;
- ignorer les dépendances ;
- poursuivre après une observation incohérente ;
- ne pas prévoir de reprise ;
- laisser le modèle décider seul des limites d'exécution.

## À retenir

La planification est une couche d'orchestration, pas une permission d'agir. Le runtime doit contrôler budgets, outils, dépendances, vérifications et reprises.

## Questions d'entretien

- Quand préférer une boucle agentique simple à une planification explicite ?
:::indice
Cherche le rapport entre complexité de la tâche et coût d'orchestration.
:::
:::reponse
Pour une tâche courte, peu ambiguë et avec peu d'outils, une boucle simple réduit latence et complexité. Une planification explicite devient utile lorsque les dépendances, étapes ou validations sont suffisamment nombreuses pour nécessiter une représentation intermédiaire.
:::

- Pourquoi vérifier le résultat métier après une action technique réussie ?
:::indice
Une requête HTTP réussie ne signifie pas nécessairement que l'état métier attendu est présent.
:::
:::reponse
Le succès technique confirme l'exécution de l'appel, pas la conformité du résultat métier. Une vérification permet de détecter les états partiels, incohérences ou réponses ambiguës avant de poursuivre le workflow.
:::
