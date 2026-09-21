---
id: ai-07-chunking
title: "Chunking, métadonnées et ingestion"
slug: chunking
technology: ai-engineering
level: intermediate
module: rag
order: 2
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-07-retrieval]
skills: [ai-rag]
tags: [rag, retrieval, llm]
---

## Objectifs
- découper des documents sans perdre leur sens ;
- choisir une taille de chunk ;
- conserver les métadonnées ;
- construire une ingestion reproductible.

## Chunking
Un chunk trop petit perd du contexte ; trop grand dilue le signal et consomme davantage de contexte. La bonne taille dépend des documents et des requêtes.

## Stratégies
Le découpage peut suivre titres, paragraphes, sections ou fenêtres glissantes. Les tableaux, listes et blocs de code demandent souvent un traitement spécifique.

```text
document -> parse -> normalize -> chunk -> metadata -> embed -> index
```

## Métadonnées
Conserve source, documentId, section, version, langue et permissions. Elles permettent filtrage et traçabilité.

## Versioning
Un document modifié doit pouvoir être réindexé sans conserver des chunks obsolètes. Utilise un identifiant stable et une version de contenu.

## Permissions
Ne récupère jamais un chunk uniquement parce qu'il est similaire : applique les autorisations au retrieval.

## Exercice
Un manuel est réindexé après modification de deux pages. Comment éviter les doublons ?

### Solution
Versionner le document et utiliser des IDs déterministes avec upsert/suppression des anciennes versions.

## À retenir
La qualité RAG commence à l'ingestion : parsing, chunking, métadonnées, versioning et ACL.


## Introduction

Le chunking détermine l'unité de connaissance indexée.

## Concept

Taille, chevauchement, structure sémantique et métadonnées influencent retrieval et contexte.

## Exemple

Un chapitre peut être découpé selon ses sections tout en conservant document_id et version.

## Comment ça fonctionne

document → parse → semantic chunks → metadata → index

## Questions d'entretien

- Pourquoi conserver la version du document dans les chunks ?

  :::indice
  Sépare toujours les erreurs de retrieval des erreurs de génération.
  :::

  :::reponse
  Pour éviter de mélanger des passages provenant de versions incompatibles.
  :::
