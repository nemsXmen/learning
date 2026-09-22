---
id: ai-10-data-protection
title: "Protection des données et confidentialité"
slug: data-protection
technology: ai-engineering
level: advanced
module: security
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

## Exercices
- Les embeddings ne sont pas automatiquement anonymes. Les données d'observabilité peuvent elles aussi révéler des informations sensibles. Il faut donc définir ce qui est journalisé et combien de temps.

:::indice
- Un log conserve le prompt complet contenant des données client. Quel problème apparaît ?
:::
:::solution
Considère le log comme une nouvelle surface de données.
:::
## Erreurs fréquentes

Le flow est : identité → autorisation → données filtrées → traitement → stockage/logs → rétention/suppression. L'isolation doit être appliquée avant retrieval et avant les écritures.

## À retenir

Le log devient une copie de données sensibles. Il faut minimiser les champs journalisés, protéger l'accès et définir une rétention adaptée.

## Introduction

Protéger les données sur tout le pipeline

## Concept

La confidentialité ne s'arrête pas au fournisseur LLM. Les prompts, logs, embeddings, caches, bases et outils peuvent tous devenir des copies de données sensibles.

## Exemple

La première défense est la minimisation : envoyer uniquement les champs nécessaires. Ensuite viennent isolation tenant, ACL, chiffrement selon le besoin, rétention, suppression et contrôle des accès aux logs.

## Comment ça fonctionne

Imagine un log qui conserve le prompt complet d'un client. Même si le modèle est sécurisé, le log devient une nouvelle copie de données sensibles avec ses propres permissions et sa propre durée de conservation.

## Questions d'entretien
- La confidentialité est une propriété de pipeline, pas une option ajoutée uniquement lors de l'appel LLM.

:::indice
Relie ta réponse à une frontière de confiance et à un contrôle déterministe.
:::
:::reponse
Pourquoi le filtrage tenant doit-il être côté serveur ?
:::