---
id: ai-08-multi-agent
title: "Orchestration multi-agents"
slug: multi-agent
technology: ai-engineering
level: advanced
module: agents
order: 7
estimatedMinutes: 90
difficulty: 5
xp: 210
prerequisites: [ai-08-guardrails]
skills: [ai-agents]
tags: [agents, orchestration, multi-agent, delegation, reliability]
---

## Objectifs

- distinguer agent unique, pipeline et système multi-agents ;
- choisir une stratégie d'orchestration adaptée au problème ;
- définir des contrats entre agents et limiter les effets de bord ;
- gérer délégation, concurrence, dépendances, échec et reprise ;
- éviter les architectures multi-agents inutiles ou difficiles à observer.

## Introduction

Un système multi-agents distribue un problème entre plusieurs rôles spécialisés : planificateur, chercheur, exécuteur, vérificateur ou agent métier. Cette spécialisation peut réduire la complexité locale, mais elle ajoute des coûts de coordination, de latence, de tokens et de contrôle.

Le bon objectif n'est donc pas de multiplier les agents. Il est de rendre la responsabilité, les contrats et les frontières d'exécution suffisamment explicites pour que le système reste déterministe autour d'un noyau probabiliste.

## Concept

### Agent unique, pipeline et multi-agents

Un agent unique convient lorsque le contexte, les outils et la politique restent simples. Un pipeline convient lorsque les étapes sont connues à l'avance. Le multi-agents devient pertinent lorsque plusieurs compétences ou contextes doivent être séparés, ou lorsque des contrôles indépendants doivent être appliqués.

### Architectures courantes

**Supervisor / workers** : un superviseur distribue des tâches à des agents spécialisés. Le superviseur conserve l'état global et décide de la prochaine délégation.

**Router** : un routeur choisit un spécialiste parmi un ensemble de capacités. Il est adapté lorsque les tâches sont mutuellement spécialisées et qu'une seule branche est généralement nécessaire.

**Peer-to-peer contrôlé** : des agents peuvent se déléguer des tâches selon un protocole explicite. Cette architecture est flexible mais augmente fortement les risques de boucles et de responsabilités ambiguës.

**Pipeline** : chaque agent produit une sortie consommée par le suivant. C'est souvent le choix le plus facile à tester lorsque les dépendances sont connues.

### Contrat inter-agent

Un message inter-agent doit définir au minimum : taskId, sender, recipient, objectif, contexte autorisé, contraintes, budget, deadline et format de résultat. Le résultat doit distinguer une décision, des données produites, les preuves disponibles et les erreurs.

Un agent ne doit pas recevoir implicitement tout l'état du système. Le principe du moindre privilège s'applique aussi au contexte transmis.

## Exemple

Imaginons un agent de support qui doit traiter une demande de remboursement.

1. Le superviseur vérifie l'identité et crée taskId.
2. Un agent policy détermine si la demande respecte les règles.
3. Un agent fraud-check recherche des signaux de risque avec des données limitées.
4. Un agent refund prépare l'action, mais ne l'exécute pas directement.
5. Le runtime applique l'autorisation finale, le budget et l'idempotence.
6. Un agent review vérifie le résultat avant de clôturer la tâche.

Le modèle peut proposer une décision à chaque étape, mais le runtime garde la capacité de refuser une transition ou une action.

## Comment ça fonctionne

### 1. Décomposer la tâche

Le superviseur transforme l'objectif en tâches avec dépendances explicites. Chaque tâche doit avoir une condition de succès observable.

~~~ts
type AgentTask = {
  taskId: string;
  capability: "policy" | "fraud-check" | "refund" | "review";
  input: unknown;
  dependsOn: string[];
  budget: { maxTokens: number; maxMs: number };
};
~~~

### 2. Exécuter avec un état explicite

L'état doit être versionné et persistant lorsque la tâche peut durer longtemps. Une transition peut être queued -> running -> succeeded, ou running -> failed -> retrying.

Les retries doivent être limités et associés à une stratégie d'idempotence. Rejouer une lecture n'a pas le même risque que rejouer un remboursement.

### 3. Contrôler la concurrence

Les tâches indépendantes peuvent être exécutées en parallèle. Les tâches dépendantes doivent attendre leurs prérequis. Il faut également limiter le nombre de workers, le budget global et le nombre de délégations.

Une architecture qui autorise une délégation récursive sans profondeur maximale peut créer une boucle coûteuse même si chaque agent individuel paraît correct.

### 4. Vérifier avant l'effet de bord

Une sortie d'agent est une proposition, pas une autorisation. Pour une action sensible, le runtime doit vérifier identité, politique, schéma, version des données, idempotency key et budget avant l'exécution.

### 5. Reprendre après interruption

Un workflow durable doit pouvoir reprendre à partir du dernier état confirmé. Il faut éviter de déduire l'état courant uniquement du dernier message du modèle.

### 6. Observer le graphe

Chaque transition devrait produire au minimum : taskId, agent, étape, durée, statut, raison de délégation, coût estimé, erreurs et identifiant de corrélation. Les traces doivent permettre de reconstruire pourquoi une tâche a changé d'agent.

## Erreurs fréquentes

- utiliser plusieurs agents alors qu'un pipeline déterministe suffit ;
- donner à tous les agents le même contexte et les mêmes outils ;
- laisser un agent décider seul de ses propres permissions ;
- ne pas limiter profondeur, fan-out, tokens ou durée ;
- partager des données sensibles sans filtrage par rôle ;
- faire des retries sur une action non idempotente ;
- ne pas distinguer échec du modèle et échec du système ;
- construire une communication libre entre agents sans protocole observable.

## Exercices

1. **Exercice 1 — Transformer un agent unique en architecture contrôlée**

Une application reçoit une demande client, consulte une base documentaire et peut créer un ticket. Proposez une architecture multi-agents minimale, puis expliquez pourquoi chaque agent existe.

:::indice
Commencez par séparer les capacités qui ont des politiques ou des contextes différents. Ne créez pas un agent uniquement pour produire une réponse plus "intelligente".
:::

:::solution
Un découpage raisonnable est router -> knowledge -> ticket -> reviewer, avec un runtime qui garde l'autorisation de créer le ticket. Si la logique documentaire et la création de ticket restent simples, un pipeline ou un agent unique peut être préférable.
:::

2. **Exercice 2 — Concevoir un contrat de délégation**

Définissez les champs indispensables d'un message entre un superviseur et un agent spécialisé.

:::indice
Pensez identité de la tâche, capacité demandée, contexte autorisé, budget, deadline, format attendu et corrélation.
:::

:::solution
Le contrat doit au minimum porter un taskId, l'émetteur, le destinataire ou la capacité, l'objectif, les entrées autorisées, les contraintes, le budget, la deadline et un format de résultat versionné. Les permissions restent déterminées par le runtime.
:::

3. **Exercice 3 — Diagnostiquer une boucle**

Un superviseur délègue à research, qui délègue à planner, qui redemande au superviseur de clarifier la tâche. Définissez quatre garde-fous.

:::indice
Cherchez des limites structurelles, pas seulement un meilleur prompt.
:::

:::solution
Limiter la profondeur de délégation, conserver un taskId et un graphe des appels, imposer un budget global et détecter les cycles ou répétitions de tâches. Une deadline et un circuit breaker complètent le contrôle.
:::

## Questions d'entretien

1. **Quand faut-il préférer un pipeline à une architecture multi-agents ?**

:::indice
Comparez déterminisme, coût de coordination, spécialisation et observabilité.
:::

:::reponse
Un pipeline est préférable lorsque les étapes sont connues, les dépendances stables et la spécialisation faible. Le multi-agents devient intéressant lorsque des responsabilités ou contextes distincts justifient réellement la coordination.
:::

2. **Pourquoi le superviseur ne doit-il pas être la seule frontière de sécurité ?**

:::indice
Le superviseur produit lui aussi des décisions probabilistes.
:::

:::reponse
Parce qu'il peut se tromper ou être manipulé. Les permissions, budgets, validations et effets de bord doivent être contrôlés par le runtime et les systèmes d'autorité indépendamment des sorties du modèle.
:::

3. **Comment rendez-vous un workflow multi-agents reprenable ?**

:::indice
Ne stockez pas uniquement les messages.
:::

:::reponse
On persiste un état versionné des tâches, transitions et résultats confirmés, avec des identifiants d'idempotence. Après interruption, le moteur reprend depuis le dernier état durable plutôt que de demander au modèle de reconstruire l'historique.
:::
