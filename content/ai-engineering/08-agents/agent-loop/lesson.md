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

## Exercice
Un agent appelle cinq fois la même recherche sans progresser. Quel mécanisme ajouter ?

### Solution
Détection de répétition/no-progress, limite d'itérations et arrêt contrôlé avec trace exploitable.

## À retenir
L'autonomie doit être bornée par un runtime déterministe.


## Introduction

Un agent répète perception, décision et action jusqu'à atteindre un objectif ou une limite.

## Concept

L'état doit être explicite et les budgets empêchent les boucles incontrôlées.

## Exemple

Limiter steps, tokens, durée et coût protège le système lorsqu'un tool échoue ou qu'une décision se répète.

## Comment ça fonctionne

state → observe → decide → act → observe

## Questions d'entretien

- Pourquoi imposer un nombre maximal d'étapes ?

  :::indice
  Cherche la frontière entre décision du modèle et contrôle déterministe.
  :::

  :::reponse
  Pour garantir une borne sur coût, durée et effets de bord.
  :::
