---
id: ai-13-architecture
title: "Architecture d'un produit AI-first"
slug: architecture
technology: ai-engineering
level: advanced
module: 13-product
order: 2
estimatedMinutes: 80
difficulty: 5
xp: 170
prerequisites: [ai-13-problem]
skills: [ai-product]
tags: [product, ux, analytics, ai]
---

## Objectifs
- séparer frontend, backend, gateway et workers ;
- gérer données et modèles ;
- prévoir évolution des fournisseurs ;
- concevoir les frontières de confiance.

## Architecture
```text
Next.js -> API -> AI gateway -> providers
              |       |
           Postgres  Redis
              |
            workers -> vector store
```

Le backend reste responsable auth, quotas, permissions, validation et effets de bord.

## Contrats
Utilise des interfaces internes stables pour prompts, modèles et tools afin de pouvoir changer un fournisseur sans réécrire le produit.

## Données
Sépare données métier, documents, embeddings, traces et artefacts d'évaluation.

## Exercice
Le produit dépend directement de trois SDK fournisseurs dans dix modules. Quel risque ?

:::indice
Relie chaque décision technique à une métrique ou un risque utilisateur concret.
:::

:::solution
Le couplage rend migrations et tests difficiles. Centraliser les appels derrière un gateway réduit la surface de changement.

:::

## À retenir
Une architecture AI-first garde les responsabilités déterministes hors du modèle.


## Introduction

Une architecture AI-first sépare interface, API, gateway, retrieval, modèles et outils.

## Concept

Les contrats internes permettent de changer fournisseurs et composants indépendamment.

## Exemple

Le backend conserve auth, quotas et effets de bord hors du modèle.

## Comment ça fonctionne

frontend → API → gateway → AI services → persistence/observability

## Questions d'entretien

- Pourquoi centraliser les appels modèles ?

  :::indice
  Relie la métrique à une décision produit concrète.
  :::

  :::reponse
  Pour maîtriser sécurité, coût, timeout, observabilité et migrations de fournisseur.
  :::
