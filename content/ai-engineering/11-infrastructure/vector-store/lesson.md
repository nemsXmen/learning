---
id: ai-11-vector-store
title: "Vector stores et architecture de recherche"
slug: vector-store
technology: ai-engineering
level: advanced
module: infrastructure
order: 4
estimatedMinutes: 75
difficulty: 5
xp: 170
prerequisites: [ai-07-embeddings]
skills: [ai-infrastructure]
tags: [infrastructure, inference, ai]
---

## Objectifs
- choisir un stockage vectoriel ;
- comprendre index et filtres ;
- gérer multi-tenant et migrations ;
- mesurer les compromis opérationnels.

## Architecture
Un vector store conserve vecteurs et métadonnées et fournit une recherche par proximité.

```text
tenant + filters -> candidate vectors -> top-k -> reranker
```

## Index
Les index ANN accélèrent la recherche approximative avec des compromis entre recall, mémoire et latence.

## Multi-tenant
Les filtres d'autorisation doivent être intégrés au retrieval et testés comme une propriété de sécurité.

## Migration
Changer dimension ou modèle d'embedding implique souvent un nouvel index et une réindexation contrôlée.

## Exercices
- Teste recall@k, latence, mémoire et isolation tenant. Une optimisation de recherche qui dégrade la sécurité ou le rappel n'est pas une amélioration globale.

:::indice
- Un index partagé retourne un chunk d'un autre tenant. Quel principe a échoué ?
:::
:::solution
Cherche le contrôle qui doit précéder la remise du résultat au modèle.
:::
## Erreurs fréquentes

Le flow est : query → embedding → ANN → metadata/ACL filter → top-k → reranking éventuel. Lors d'un changement de modèle d'embedding ou de dimension, une nouvelle génération d'index et une réindexation contrôlée peuvent être nécessaires.

## À retenir

L'isolation d'autorisation au retrieval a échoué. Le filtre tenant doit être imposé côté serveur et couvert par des tests.

## Introduction

Concevoir une recherche vectorielle exploitable

## Concept

Un vector store n'est pas seulement une base de nombres. Il doit stocker des vecteurs avec leurs métadonnées, appliquer des filtres, répondre avec une latence prévisible et permettre des migrations sans casser le retrieval.

## Exemple

La recherche ANN (Approximate Nearest Neighbor) accélère la recherche en acceptant un compromis contrôlé entre rappel, mémoire et latence. Les métadonnées servent notamment à filtrer tenant, document, langue ou version.

## Comment ça fonctionne

Supposons deux tenants qui utilisent le même index. Une similarité élevée ne suffit jamais pour décider qu'un chunk est accessible : le filtre d'autorisation doit être imposé par le serveur.

## Questions d'entretien
- Un vector store est une infrastructure de données avec des contraintes simultanées de recherche, sécurité et exploitation.

:::indice
Relie ta réponse à une métrique et à une contrainte système.
:::
:::reponse
Pourquoi les migrations d'embeddings sont-elles coûteuses ?
:::