---
id: ai-data-modelisation
title: "Modéliser les données pour les systèmes AI"
slug: modelisation-donnees
technology: ai-engineering
level: beginner
module: data
order: 1
estimatedMinutes: 50
difficulty: 3
xp: 110
prerequisites: [ai-python-fondamentaux]
skills: [ai-data-modeling]
tags: [data, schema, database, ai]
---

## Objectifs

- distinguer donnée brute, document, exemple d'entraînement et métadonnée ;
- concevoir un schéma stable pour un pipeline AI ;
- identifier clés, contraintes et relations ;
- découpler le modèle métier des fournisseurs de modèles.

## Les représentations d'une même donnée

Un système AI manipule souvent source originale, contenu normalisé, chunks, embeddings, résultats de retrieval, réponses et traces. Une erreur de modélisation peut rendre l'audit impossible.

## Document et provenance

Exemple de représentation interne :

```json
{
  "id": "doc_123",
  "source_id": "crm_42",
  "source_type": "ticket",
  "title": "Remboursement",
  "content": "...",
  "metadata": {"language": "fr", "tenant_id": "tenant_7"},
  "version": 3
}
```

La provenance permet de retrouver l'origine d'un chunk ou d'une réponse.

## Identité et idempotence

Définis une clé d'identité métier et une stratégie de mise à jour. Par exemple, tenant_id + source_type + source_id + version peut identifier une version de document.

## Contrat interne vs fournisseur

Ne stocke pas directement toute la réponse d'un SDK comme modèle métier. Préfère un contrat interne :

```text
GenerateRequest
  messages
  model
  temperature
  response_format

GenerateResult
  text
  usage
  provider
  model
  request_id
```

Un adaptateur traduit ensuite ce contrat vers le fournisseur choisi.

## Multi-tenant

Dans un SaaS, tenant_id doit participer à la frontière de données lorsque les utilisateurs ne doivent pas accéder aux données d'un autre tenant. Le filtre doit être appliqué systématiquement et renforcé si possible par les mécanismes de sécurité de la base.

## Exercices

Conçois le modèle minimal d'un chunk RAG permettant de retrouver document, version, tenant, texte et embedding.

:::indice
Identifie d'abord les invariants, puis vérifie les données avant de produire la sortie.
:::

:::solution

```text
chunk
  id
  document_id
  document_version
  tenant_id
  position
  text
  embedding
  metadata
  created_at
```

Ajoute une contrainte d'unicité adaptée au processus d'ingestion.

:::

## À retenir

La donnée AI doit être traçable, versionnée et découplée des fournisseurs. Un bon schéma rend les pipelines idempotents, auditables et évolutifs.


## Introduction

La modélisation organise les données pour qu'un système AI puisse les retrouver et les relier sans ambiguïté.

## Concept

Une donnée utile possède identité, provenance, schéma et contexte.

## Exemple

Un document peut avoir un identifiant stable, une version, une source et des métadonnées de filtrage.

## Comment ça fonctionne

ingestion → normalisation → identité → stockage → consommation

## Questions d'entretien

- Pourquoi la provenance compte-t-elle ?

  :::indice
  Pense à la reproductibilité et aux erreurs silencieuses.
  :::

  :::reponse
  Elle permet de comprendre d'où vient une donnée et de diagnostiquer ou corriger une sortie.
  :::
