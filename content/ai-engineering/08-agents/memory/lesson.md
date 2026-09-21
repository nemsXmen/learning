---
id: ai-08-memory
title: "Mémoire agentique et contexte"
slug: memory
technology: ai-engineering
level: advanced
module: agents
order: 2
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-08-agent-loop]
skills: [ai-agents]
tags: [agents, tools, orchestration, safety]
---

## Objectifs
- distinguer contexte de session et mémoire persistante ;
- contrôler ce qui est mémorisé ;
- éviter la croissance infinie du contexte ;
- respecter permissions et rétention.

## Types de mémoire
Mémoire de travail : état de la tâche actuelle. Mémoire conversationnelle : historique utile. Mémoire persistante : informations conservées entre sessions.

## Sélection
Ne verse pas tout l'historique dans chaque requête. Résume, récupère et filtre selon la tâche.

```text
request -> relevant memory retrieval -> context -> model
                         ^
                    memory store
```

## Sécurité
Une mémoire persistante peut contenir des données sensibles. Applique ACL, chiffrement selon le contexte, suppression et durée de rétention.

## Exercice
Un utilisateur demande la suppression de ses données mémorisées. Que doit faire le système ?

### Solution
Identifier les enregistrements concernés, supprimer ou anonymiser selon la politique applicable, invalider les caches puis journaliser l'opération.

## À retenir
La mémoire est une fonctionnalité de données, avec cycle de vie et gouvernance, pas une simple liste de messages.


## Introduction

La mémoire d'un agent doit distinguer contexte de session et connaissance persistante.

## Concept

Mémoire de travail, session et persistance ont des politiques de rétention et d'accès différentes.

## Exemple

Une préférence utilisateur persistante doit être stockée avec tenant, provenance et possibilité de suppression.

## Comment ça fonctionne

input → retrieve memory → reason → update memory

## Questions d'entretien

- Pourquoi une mémoire persistante nécessite-t-elle des ACL ?

  :::indice
  Cherche la frontière entre décision du modèle et contrôle déterministe.
  :::

  :::reponse
  Parce qu'elle peut contenir des données personnelles ou appartenant à un tenant.
  :::
