---
id: ai-10-data-protection
title: "Protection des données et confidentialité"
slug: data-protection
technology: ai-engineering
level: advanced
module: 10-security
order: 3
estimatedMinutes: 75
difficulty: 5
xp: 170
prerequisites: [ai-10-prompt-injection]
skills: [ai-security]
tags: [security, ai, llm]
---

## Objectifs
- minimiser les données envoyées aux modèles ;
- gérer rétention et suppression ;
- séparer tenants et permissions ;
- tracer les flux sensibles.

## Data minimization
N'envoie au modèle que les champs nécessaires. Masque ou pseudonymise les informations inutiles.

## Multi-tenant
```text
tenant -> authorization -> retrieval -> model
                         |
                    filtered data
```

L'isolation doit être appliquée avant retrieval et avant toute écriture.

## Rétention
Définis durée de conservation, suppression, backups et logs. Les données d'observabilité peuvent elles-mêmes être sensibles.

## Exercice
Un log conserve le prompt complet contenant des données client. Quel problème apparaît ?

### Solution
Le log devient une copie de données sensibles. Réduire les données journalisées et définir une rétention adaptée.

## À retenir
La confidentialité concerne tout le pipeline, pas uniquement le fournisseur LLM.
