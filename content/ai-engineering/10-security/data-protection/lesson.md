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


## Introduction

Un produit AI traite souvent des données sensibles et doit minimiser ce qu'il collecte.

## Concept

Tenant isolation, ACL, rétention et chiffrement sont des contrôles de données indépendants du modèle.

## Exemple

Une requête d'un tenant ne doit jamais récupérer des embeddings d'un autre tenant.

## Comment ça fonctionne

identity → authorization → filtered retrieval → processing → retention

## Questions d'entretien

- Pourquoi le filtrage tenant doit-il être côté serveur ?

  :::indice
  Pense aux contrôles qui restent fiables même si le modèle se trompe.
  :::

  :::reponse
  Parce que le client et le modèle ne sont pas des frontières de confiance.
  :::
