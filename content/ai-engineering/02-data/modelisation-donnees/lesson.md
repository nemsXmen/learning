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

À la fin de cette leçon, tu dois pouvoir :

- distinguer donnée brute, document, chunk, embedding et résultat de modèle ;
- concevoir une identité stable pour une donnée ;
- conserver provenance et version ;
- séparer le modèle métier des APIs de fournisseurs IA ;
- repérer les frontières de données dans un SaaS multi-tenant.

## Le problème de modélisation

Un système IA ne manipule pas « une donnée ». Il manipule plusieurs représentations successives :

```text
source
  ↓
document
  ↓
chunk
  ↓
embedding
  ↓
retrieval
  ↓
réponse
```

Si l'identité ou la provenance disparaît à une étape, tu peux obtenir une réponse correcte sans être capable de répondre à une question essentielle :

> « De quelle source exacte cette réponse provient-elle ? »

La modélisation est donc une partie de la fiabilité du système.

## Document : identité, contenu et contexte

Une représentation interne peut ressembler à :

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

Chaque champ répond à une question différente :

- `id` : quelle entité interne ?
- `source_id` : d'où vient-elle ?
- `version` : quelle évolution ?
- `content` : quel contenu ?
- `metadata` : dans quel contexte peut-on l'utiliser ?

## Identité et idempotence

Supposons que le même document soit reçu deux fois.

Sans identité stable :

```text
import 1 → chunk A
import 2 → chunk B
```

Le système peut créer des doublons.

Avec une clé déterministe, l'ingestion peut reconnaître la même entité :

```text
tenant + source_type + source_id + version
```

Pour un chunk, on peut ensuite utiliser :

```text
document_id + document_version + position
```

La clé exacte dépend du métier. Ce qui compte est qu'elle représente un invariant réel.

## Provenance : pouvoir remonter la chaîne

Imagine une réponse :

```text
« Les remboursements sont traités sous 5 jours. »
```

Un système exploitable doit pouvoir retrouver :

```text
réponse
  → chunks utilisés
  → document
  → version
  → source originale
```

Cette chaîne s'appelle souvent lineage ou provenance.

Elle sert au débogage, à l'audit, à la mise à jour d'index et à l'analyse des réponses incorrectes.

## Ne pas coupler le domaine à un fournisseur

Évite de faire circuler partout dans ton application les objets spécifiques d'un SDK.

Préfère un contrat interne :

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

Puis un adaptateur traduit ce contrat vers le fournisseur.

Résultat : changer de fournisseur ne force pas à réécrire toute la logique métier.

## Multi-tenant : une frontière de sécurité

Dans un SaaS, `tenant_id` n'est pas simplement une métadonnée pratique.

Si deux entreprises utilisent la même base :

```text
tenant A → documents A
tenant B → documents B
```

Un retrieval qui oublie le filtre de tenant peut devenir une fuite de données.

Le filtrage doit donc être imposé par l'architecture, testé et, lorsque possible, renforcé par les contrôles de la base de données.

## Concevoir avant de stocker

Avant de créer une table ou un index, réponds :

1. quelle est l'identité ?
2. quelle est la source ?
3. quelle est la version ?
4. quelles relations dois-je retrouver ?
5. quelles données peuvent être supprimées ?
6. quelles données sont sensibles ?
7. quel accès est autorisé ?
8. comment vais-je réindexer ou reconstruire ?

Ces questions évitent le classique « on stocke tout maintenant, on verra plus tard ».

## Erreurs fréquentes

- utiliser un identifiant technique comme identité métier sans réflexion ;
- perdre la provenance lors du chunking ;
- mélanger données métier et objets de SDK ;
- oublier le tenant dans les requêtes de retrieval ;
- rendre un schéma impossible à migrer ;
- stocker des données sensibles sans politique de rétention.

## Exercices

- Conçois le modèle minimal d'un chunk RAG.
- Explique comment retrouver la source d'une citation affichée dans une réponse.
- Un SaaS possède deux tenants. Quel bug de retrieval pourrait exposer des documents du tenant A au tenant B ?

:::indice
Pour chaque objet, demande-toi : « comment puis-je retrouver son parent exact et vérifier que l'utilisateur a le droit de le voir ? »
:::

:::solution
Un chunk peut contenir `id`, `document_id`, `document_version`, `tenant_id`, `position`, `text`, `embedding` et les métadonnées nécessaires. La provenance relie réponse → chunk → document → version → source. Le bug critique est l'absence ou le contournement du filtre `tenant_id` dans le retrieval.
:::

## À retenir

Un bon modèle de données rend explicites identité, provenance, version, relations et frontières d'accès. En IA, la modélisation prépare directement l'audit, le RAG, l'évaluation et la production.

## Questions d'entretien

- Pourquoi la provenance est-elle importante dans un RAG ?
- Pourquoi créer un contrat interne autour d'un fournisseur LLM ?
- Où placer la frontière multi-tenant ?

:::indice
Réponds en termes de conséquences opérationnelles, pas uniquement de définition.
:::

:::reponse
La provenance permet de diagnostiquer et justifier une réponse. Un contrat interne réduit le couplage et facilite les changements de fournisseur. La frontière multi-tenant doit être imposée au niveau des requêtes et renforcée par les contrôles d'accès disponibles.
:::
