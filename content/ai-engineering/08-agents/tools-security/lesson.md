---
id: ai-08-tools-security
title: "Sécurité des agents et outils"
slug: tools-security
technology: ai-engineering
level: advanced
module: agents
order: 4
estimatedMinutes: 80
difficulty: 5
xp: 180
prerequisites: [ai-08-orchestration]
skills: [ai-agents]
tags: [agents, tools, orchestration, safety]
---

## Objectifs
- réduire le privilège des agents ;
- séparer planification et exécution ;
- contrôler secrets et outils ;
- auditer les actions.

## Least privilege
Un agent ne doit accéder qu'aux données et outils nécessaires à sa tâche. Les permissions viennent de l'application, jamais d'une réponse du modèle.

## Approval boundary
Pour une action sensible, le modèle peut préparer une proposition ; un service autorisé décide si elle peut être exécutée.

```text
model proposal -> policy check -> authorization -> side effect
```

## Secrets
Ne donne pas les clés API directement au contexte du modèle. Le serveur appelle les services avec des credentials protégés.

## Audit
Journalise acteur, outil, paramètres minimisés, décision d'autorisation, résultat, request ID et timestamp.

## Exercices
- Un audit utile conserve qui a demandé l'action, quel outil a été appelé, quelle décision d'autorisation a été prise et quel résultat est arrivé, tout en minimisant les données sensibles enregistrées.

:::indice
- Un agent propose un remboursement. Quelle frontière appliquer ?
::

:::solution
Sépare la proposition du modèle de l'autorisation métier.
::
## Erreurs fréquentes

Le flow est : agent → proposition d'action → policy check → authorization → tool → side effect → audit. Les secrets restent côté serveur. Pour du code ou des opérations risquées, ajoute sandbox, timeout, quotas CPU/mémoire, filesystem restreint et réseau contrôlé.

## À retenir

Le backend valide identité, montant, permissions et idempotence. L'agent ne peut exécuter que l'outil déjà soumis à ces contrôles.

## Introduction

Sécuriser un agent qui peut agir

## Concept

Plus un agent possède d'outils, plus une erreur de raisonnement ou une donnée malveillante peut avoir des conséquences. La sécurité consiste donc à limiter ce que l'agent peut réellement faire.

## Exemple

Le principe central est le least privilege : l'agent reçoit uniquement les capacités nécessaires. Les permissions sont décidées par le système d'autorisation, jamais par une instruction générée par le modèle.

## Comment ça fonctionne

Pour un agent de support, lire une facture peut être autorisé automatiquement alors qu'un remboursement nécessite une vérification supplémentaire. Le modèle peut préparer la proposition, mais un service déterministe contrôle identité, montant, règles métier et idempotence.

## Questions d'entretien
- Un agent puissant doit rester moins privilégié que le système qu'il pilote.

:::indice
Pense à la séparation entre modèle, runtime et système d'autorisation.
::

:::reponse
Pourquoi l'autorisation doit-elle rester hors du prompt ?
::