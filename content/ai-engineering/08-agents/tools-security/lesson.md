---
id: ai-08-tools-security
title: "Sécurité des agents et outils"
slug: tools-security
technology: ai-engineering
level: advanced
module: 08-agents
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

## Exercice
Un agent propose un remboursement. Quelle frontière appliquer ?

### Solution
Valider identité, montant, règles métier et idempotence dans le backend ; l'agent ne fait que proposer ou déclencher un outil déjà autorisé.

## À retenir
Un agent puissant doit rester moins privilégié que le système qu'il pilote.
