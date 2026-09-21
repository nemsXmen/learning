---
id: ai-07-chunking
title: "Chunking, métadonnées et ingestion"
slug: chunking
technology: ai-engineering
level: intermediate
module: 07-rag
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
Un chunk trop petit perd le contexte ; trop grand, il dilue le signal et consomme davantage de contexte. La bonne taille dépend du type de document et des requêtes.

## Stratégies
Le découpage peut suivre titres, paragraphes, sections ou fenêtres glissantes. Les tableaux, listes et blocs de code nécessitent souvent un traitement spécifique.

```text
document -> parse -> normalize -> chunk -> enrich metadata -> embed -> index
```

## Métadonnées
Conserve source, documentId, section, version, langue et permissions. Les métadonnées permettent filtrage et traçabilité.

## Versioning
Un document modifié doit pouvoir être réindexé sans laisser des chunks obsolètes. Utilise un identifiant stable et une version de contenu.

## Permissions
Ne récupère jamais un chunk uniquement parce qu'il est similaire : applique les autorisations au retrieval.

## Exercice
Un manuel de 100 pages est réindexé après modification de 2 pages. Comment éviter les doublons ?

### Solution
Versionner les documents et utiliser des IDs déterministes ou une stratégie d'upsert/suppression des anciennes versions.

## À retenir
La qualité RAG commence à l'ingestion : parsing, chunking, métadonnées, versioning et ACL.
