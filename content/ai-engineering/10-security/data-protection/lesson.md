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
skills: [ai-engineering]
tags: [ai, production, engineering]
---

## Objectifs
- minimiser les données envoyées aux modèles ;
- gérer rétention et suppression ;
- séparer tenants et permissions ;
- tracer les flux sensibles.

## Data minimization
N'envoie au modèle que les champs nécessaires. Masque ou pseudonymise les informations qui n'ont pas besoin d'être exposées.

## Multi-tenant
```text
tenant -> authorization -> retrieval -> model
                         |
                    filtered data
```

L'isolation doit être appliquée avant retrieval et avant toute opération d'écriture.

## Rétention
Définis durée de conservation, suppression, backups et logs. Les données d'observabilité peuvent elles-mêmes contenir des informations sensibles.

## Exercice
Un log conserve le prompt complet contenant des données client. Quel problème apparaît ?

### Solution
Le log devient une copie de données sensibles. Réduire les données journalisées, masquer les champs sensibles et définir une politique de rétention.

## À retenir
La confidentialité concerne tout le pipeline, pas uniquement le fournisseur LLM.
