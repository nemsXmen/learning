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

## Exercices
- Une mémoire persistante peut contenir des données personnelles ou confidentielles. Il faut donc gérer ACL, suppression, rétention, provenance et invalidation de cache. La mémoire ne doit pas devenir une source d'instructions privilégiées sans validation.

:::indice
- Un utilisateur demande la suppression de ses données mémorisées. Que doit faire le système ?
:::
:::solution
Traite la mémoire comme des données soumises à un cycle de vie.
:::
## Erreurs fréquentes

Le flow est : requête → recherche des souvenirs pertinents → sélection/filtrage → contexte → raisonnement → éventuelle mise à jour de la mémoire. Un store peut être relationnel, vectoriel ou hybride selon le type de donnée.

## À retenir

Identifier les enregistrements concernés, appliquer la politique de suppression ou d'anonymisation, invalider les caches concernés et tracer l'opération.

## Introduction

La mémoire comme système de données

## Concept

Une conversation et une mémoire persistante ne sont pas la même chose. L'historique sert au contexte immédiat ; une mémoire persistante conserve certaines informations entre sessions et devient donc un véritable système de données.

## Exemple

On peut distinguer mémoire de travail, mémoire de session et mémoire persistante. Chacune doit avoir une politique de sélection, de rétention et d'accès adaptée.

## Comment ça fonctionne

Si un utilisateur indique une préférence durable, le système peut la stocker avec sa provenance, son tenant et sa date. Mais il ne faut pas injecter toute la mémoire à chaque requête : seules les informations pertinentes doivent être récupérées.

## Questions d'entretien
- La mémoire agentique est une fonctionnalité de données avec gouvernance, pas simplement une liste de messages.

:::indice
Pense à la séparation entre modèle, runtime et système d'autorisation.
:::
:::reponse
Pourquoi une mémoire persistante nécessite-t-elle des ACL ?
:::