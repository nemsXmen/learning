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

## Exercices
- Lorsqu'un document est modifié, les anciens chunks ne doivent pas rester silencieusement mélangés aux nouveaux. Utilise des identifiants déterministes, une version de contenu et une stratégie d'upsert ou de suppression.

:::indice
- Un manuel est réindexé après modification de deux pages. Comment éviter les doublons ?
::

:::solution
Pense en termes de version de document et d'identifiants déterministes.
::
## Erreurs fréquentes

Le flow est : document → parsing → normalisation → chunks sémantiques → métadonnées → embeddings → index. Chaque chunk doit conserver source, documentId, section, version, langue et permissions utiles au retrieval.

## À retenir

Associer chaque chunk à une version du document puis remplacer ou supprimer proprement l'ancienne version avant l'indexation de la nouvelle.

## Introduction

Le chunking comme unité de connaissance

## Concept

Avant de créer des embeddings, il faut décider quelle portion du document sera indexée. Cette décision paraît technique, mais elle influence directement ce que le système pourra retrouver.

## Exemple

Un chunk trop petit perd des relations entre phrases. Un chunk trop grand contient davantage de bruit et consomme plus de contexte. La structure du document est souvent un meilleur guide qu'une taille fixe arbitraire.

## Comment ça fonctionne

Pour un manuel technique, découper selon les titres et sous-sections conserve mieux le sens qu'une coupe aveugle tous les 500 caractères. Les tableaux, listes et blocs de code peuvent nécessiter des règles spécifiques.

## Questions d'entretien
- La qualité RAG commence avant le modèle : parsing, chunking, métadonnées, versioning et ACL font partie du pipeline.

:::indice
Relie ta réponse à la séparation entre retrieval et génération.
::

:::reponse
Pourquoi conserver la version du document dans les chunks ?
::