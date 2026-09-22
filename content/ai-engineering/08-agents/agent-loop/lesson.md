---
id: ai-08-agent-loop
title: "Boucle agentique et état"
slug: agent-loop
technology: ai-engineering
level: advanced
module: agents
order: 1
estimatedMinutes: 75
difficulty: 5
xp: 170
prerequisites: [ai-07-rag-evaluation]
skills: [ai-agents]
tags: [agents, tools, orchestration, safety]
---

## Objectifs
- comprendre la boucle perception-décision-action ;
- définir un état explicite ;
- limiter les itérations ;
- distinguer planification et exécution.

## Boucle
```text
input -> state -> model -> tool -> observation -> state -> ...
```
Un agent n'est pas simplement un prompt long : il possède une boucle d'exécution et un état contrôlé.

## Garde-fous
Définis budget de tokens, nombre maximal d'étapes, timeout, outils autorisés et condition d'arrêt.

## Idempotence
Une reprise peut répéter une action. Les opérations à effet de bord doivent donc utiliser des clés d'idempotence et des contrôles métier.

## Exercices
- L'autonomie ne doit jamais signifier absence de limites. Un agent peut échouer, tourner en boucle ou répéter une action après un retry réseau. Les garde-fous appartiennent au runtime, pas uniquement au prompt.

:::indice
- Un agent appelle cinq fois la même recherche sans progresser. Quel mécanisme ajouter ?
:::
:::solution
Cherche un signal de no-progress et une borne d'exécution.
:::
## Erreurs fréquentes

Le flow est : input → state → model → tool request → validation → execution → observation → state. Ajoute nombre maximal d'étapes, timeout global, budget de tokens/coût et détection de répétition. Les actions à effet de bord doivent être idempotentes.

## À retenir

Détecter les appels répétitifs, imposer une limite d'étapes et arrêter proprement avec une trace permettant le diagnostic.

## Introduction

Un agent est une boucle, pas seulement un prompt

## Concept

Un agent devient intéressant lorsqu'un modèle doit observer un état, décider d'une prochaine action, utiliser un outil puis interpréter le résultat. La différence avec un simple appel LLM est donc la boucle d'exécution.

## Exemple

L'état doit être explicite : objectif, observations, actions déjà réalisées, résultats et budgets restants. Le runtime déterministe décide quand la boucle commence, quand elle s'arrête et quels outils sont disponibles.

## Comment ça fonctionne

Imagine un agent qui doit retrouver une facture puis préparer une réponse. Il peut rechercher, observer le résultat, décider de préciser la recherche, puis produire une proposition. Si la même recherche est répétée sans progrès, le runtime doit pouvoir arrêter la boucle.

## Questions d'entretien
- L'autonomie agentique est bornée par un runtime déterministe : état explicite, budgets, permissions et conditions d'arrêt.

:::indice
Pense à la séparation entre modèle, runtime et système d'autorisation.
:::
:::reponse
Pourquoi imposer un nombre maximal d'étapes ?
:::