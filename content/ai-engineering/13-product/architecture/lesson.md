---
id: ai-13-architecture
title: "Architecture d'un produit AI-first"
slug: architecture
technology: ai-engineering
level: advanced
module: product
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

## Exercices
- Une abstraction trop complexe peut devenir une nouvelle dette. Le contrat doit exposer les capacités nécessaires au produit sans masquer les contraintes importantes du fournisseur.

:::indice
Le produit dépend directement de trois SDK fournisseurs dans dix modules. Quel risque ?
:::
:::solution
Cherche le coût d'un changement de fournisseur.
:::
## Erreurs fréquentes

Le flow est : frontend → API → gateway → services AI → persistence/observability. Les données métier, documents, embeddings, traces et artefacts d'évaluation ont des cycles de vie distincts.

## À retenir

Le couplage rend migrations et tests difficiles. Centraliser les appels derrière un gateway réduit la surface de changement.

## Introduction

Construire une architecture qui garde le contrôle

## Concept

Un produit AI robuste sépare les responsabilités : interface, API, gateway, retrieval, workers, stockage et fournisseurs de modèles. Cette séparation permet de faire évoluer chaque partie sans donner au modèle des responsabilités qu'il ne doit pas posséder.

## Exemple

Le backend reste responsable de l'identité, des permissions, quotas, validation et effets de bord. Un gateway interne fournit un contrat stable pour les modèles, prompts et tools.

## Comment ça fonctionne

Si dix modules appellent directement trois SDK fournisseurs, chaque migration devient une modification distribuée. Une abstraction interne réduit le couplage et centralise timeout, coût, sécurité et observabilité.

## Questions d'entretien
- Une architecture AI-first garde les responsabilités déterministes hors du modèle.

:::indice
Relie ta réponse à une décision produit mesurable.
:::
:::reponse
Pourquoi centraliser les appels modèles ?
:::