---
id: ai-data-modelisation
title: "Modéliser les données pour les systèmes AI"
slug: modelisation-donnees
technology: ai-engineering
level: beginner
module: data
order: 1
estimatedMinutes: 65
difficulty: 3
xp: 110
prerequisites: [ai-python-fondamentaux]
skills: [ai-data-modeling]
tags: [data, schema, provenance, multi-tenant]
---

## Objectifs

À la fin de cette leçon, tu dois pouvoir distinguer les différentes représentations d'une donnée dans un système IA, définir une identité stable, conserver sa provenance et sa version, et concevoir un modèle qui reste indépendant d'un fournisseur de modèle.

## Introduction

Quand une application classique reçoit une donnée, elle peut souvent la stocker puis la relire. Un système IA ajoute plusieurs transformations. Un document peut être découpé en chunks, transformé en embeddings, retrouvé par une recherche, injecté dans un contexte puis utilisé pour produire une réponse.

Si nous perdons l'identité d'un objet pendant cette chaîne, nous perdons aussi la capacité à expliquer le résultat.

Le problème de modélisation est donc simple à formuler : comment conserver assez d'information pour savoir ce que représente chaque objet, d'où il vient, quelle version il représente et qui a le droit de l'utiliser ?

## Concept

Un document peut être représenté ainsi :

```json
{
  "id": "doc_123",
  "source_id": "crm_42",
  "source_type": "ticket",
  "version": 3,
  "content": "...",
  "metadata": {
    "language": "fr",
    "tenant_id": "tenant_7"
  }
}
```

Chaque champ joue un rôle précis. `id` identifie l'objet dans notre système. `source_id` permet de remonter vers le système d'origine. `version` distingue plusieurs états du même document. Les métadonnées donnent le contexte nécessaire aux traitements et aux contrôles d'accès.

Une bonne modélisation commence par les invariants du domaine, pas par les colonnes disponibles dans une base.

## Exemple

Imaginons que le CRM envoie deux fois le ticket `crm_42`. Si l'ingestion crée deux objets indépendants, le même contenu peut être indexé deux fois.

On peut définir une identité logique comme :

```text
tenant_id + source_type + source_id + version
```

Pour un chunk, on peut ensuite ajouter sa position :

```text
document_id + document_version + chunk_position
```

La clé exacte dépend du métier. L'important est qu'elle permette au système de reconnaître le même objet lorsqu'un job est relancé.

## Comment ça fonctionne

Le flux de données peut être compris comme une succession de contrats :

```text
source
  ↓
document identifié
  ↓
document versionné
  ↓
chunks avec provenance
  ↓
embeddings liés aux chunks
  ↓
index filtrable
  ↓
retrieval
  ↓
réponse traçable
```

Supposons maintenant qu'un utilisateur reçoive une réponse incorrecte. L'équipe doit pouvoir remonter de la réponse vers les chunks utilisés, puis vers les documents et leurs versions. Cette chaîne de remontée constitue la provenance, ou lineage.

Sans elle, on peut constater qu'une réponse est mauvaise sans savoir quelle donnée l'a provoquée.

## Contrat interne et fournisseur

Une autre erreur fréquente consiste à utiliser directement les objets d'un SDK de fournisseur dans toute l'application.

Préférons un contrat interne :

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

L'adaptateur du fournisseur traduit ensuite ce contrat.

Ainsi, la logique métier connaît notre propre modèle de données plutôt que les détails d'un SDK. Cette séparation devient particulièrement utile lorsqu'un produit doit changer de fournisseur ou faire fonctionner plusieurs fournisseurs.

## Multi-tenant

Dans un SaaS, `tenant_id` doit être considéré comme une frontière de sécurité.

Supposons que deux entreprises possèdent chacune leurs documents :

```text
tenant A → documents A
tenant B → documents B
```

Une recherche vectorielle qui retourne les cinq documents les plus proches sans filtrer le tenant peut mélanger les deux univers.

Le filtre d'accès doit donc être imposé dans le chemin de retrieval, testé et, lorsque l'architecture le permet, renforcé par les mécanismes de sécurité de la base.

## Erreurs fréquentes

- choisir un identifiant technique sans définir l'identité métier ;
- perdre la provenance lors du chunking ;
- mélanger les objets métier avec ceux d'un SDK ;
- oublier le tenant dans une requête de retrieval ;
- stocker des données sans réfléchir à leur version et à leur durée de conservation.

## Exercices
- Conçois le modèle minimal d'un chunk RAG qui permette de retrouver son document, sa version et son tenant.
  - Explique le chemin permettant de retrouver la source d'une citation affichée à l'utilisateur.
  - Identifie le bug de sécurité présent dans un retrieval qui filtre uniquement par similarité.

:::indice
Pour chaque objet, demande-toi : « comment puis-je retrouver son parent exact et vérifier que l'utilisateur a le droit de le voir ? »
:::
:::solution
Un chunk peut contenir `id`, `document_id`, `document_version`, `tenant_id`, `position`, `text`, `embedding` et les métadonnées nécessaires. La citation doit pouvoir remonter vers le chunk puis le document, sa version et la source. Un retrieval sans filtre de tenant peut retourner les données d'une autre entreprise.
:::
## À retenir

La modélisation des données est une partie de l'architecture IA. Une identité stable, une provenance complète, une version explicite et une frontière d'accès claire rendent les traitements auditables et reconstruisibles.

## Questions d'entretien
- Pourquoi la provenance est-elle importante dans un système RAG ?
  - Pourquoi isoler les contrats d'un fournisseur LLM du modèle métier ?
  - Pourquoi `tenant_id` peut-il être une donnée de sécurité et pas seulement une métadonnée ?

:::indice
Explique les conséquences concrètes d'un mauvais modèle de données.
:::
:::reponse
La provenance permet de diagnostiquer une réponse et de retrouver les données qui l'ont produite. Un contrat interne limite le couplage et facilite les changements de fournisseur. Le tenant définit une frontière d'accès : l'oublier dans le retrieval peut provoquer une fuite inter-client.
:::