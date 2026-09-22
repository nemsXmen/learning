---
id: ai-10-threat-model
title: "Threat modeling pour les systèmes IA"
slug: threat-model
technology: ai-engineering
level: advanced
module: security
order: 1
estimatedMinutes: 70
difficulty: 5
xp: 160
prerequisites: [ai-09-regression]
skills: [ai-security]
tags: [security, ai, llm]
---

## Objectifs
- identifier les actifs et frontières de confiance ;
- modéliser les menaces spécifiques à l'IA ;
- relier menaces et contrôles ;
- prioriser les risques.

## Actifs
Cartographie prompts, données, secrets, modèles, outils, bases, sorties et actions métier. Définis qui peut accéder à chacun.

## Threat model
```text
asset -> trust boundary -> threat -> impact -> control -> residual risk
```

Les risques incluent injection, exfiltration, abus d'outils, fuite de données, empoisonnement, déni de service et coûts non maîtrisés.

## Contrôles
Associe chaque menace à des mesures : validation, isolation, ACL, rate limit, sandbox, logging et approbation.

## Exercices

Un prompt plus strict ne remplace pas une autorisation serveur. Une défense utile reste efficace même lorsque le modèle produit une sortie inattendue.

:::indice
- Un document externe peut influencer un agent qui possède un outil d'écriture. Quelle frontière protéger ?
:::

:::solution
Le document doit être considéré comme une donnée non fiable.
:::

## Erreurs fréquentes

Le flow est : actifs → frontières de confiance → menaces → impact → contrôles → risque résiduel. Les contrôles peuvent inclure ACL, validation, sandbox, rate limit, approbation et logging.

## À retenir

Le document peut influencer le raisonnement, mais l'autorisation d'écriture doit être décidée par un contrôle déterministe côté serveur.

## Introduction

Commencer par les frontières de confiance

## Concept

Un système AI combine utilisateur, modèle, données, outils et services externes. Avant de choisir une défense, il faut savoir quels actifs existent et où une donnée change de niveau de confiance.

## Exemple

Cartographie prompts, documents, secrets, modèles, bases, embeddings, outils et actions métier. Pour chaque élément, demande qui peut le lire, le modifier et le faire agir.

## Comment ça fonctionne

Dans un RAG multi-tenant, les documents, embeddings et identités sont des actifs distincts. Une erreur d'isolation peut permettre à une requête d'un tenant de récupérer des informations d'un autre.

## Questions d'entretien

Le threat modeling relie chaque menace à un contrôle vérifiable et à un risque résiduel.

:::indice
Relie ta réponse à une frontière de confiance et à un contrôle déterministe.
:::

:::reponse
Pourquoi modéliser les frontières de confiance ?
:::
