---
id: ai-15-build
title: "Capstone : construire le produit par itérations"
slug: build
technology: ai-engineering
level: expert
module: 15-capstone
order: 2
estimatedMinutes: 120
difficulty: 5
xp: 280
prerequisites: [ai-15-architecture]
skills: [ai-capstone]
tags: [capstone, architecture, rag, agents, production]
---

## Objectifs
- découper une implémentation complexe ;
- définir des contrats ;
- construire verticalement ;
- tester chaque couche.

## Phases
```text
1. foundation -> auth, DB, config
2. AI gateway -> provider contract
3. RAG -> ingestion + retrieval
4. agent -> tools + policies
5. product -> UI + streaming
6. ops -> observability + quotas + billing
```

Commence par un vertical slice fonctionnel avant d'ajouter des abstractions.

## Contrats
Versionne les schémas d'entrée/sortie. Valide côté serveur les réponses structurées et les paramètres des tools.

## Tests
Combine unit tests, integration tests, API tests et tests d'évaluation IA. Les effets de bord doivent être testables sans appeler réellement des services coûteux.

## Exercice
Pourquoi construire d'abord un gateway abstrait plutôt que disperser les appels LLM ?

### Solution
Pour centraliser timeout, retry, sécurité, coût, observabilité et changement de fournisseur.

## À retenir
Un capstone solide progresse par tranches verticales vérifiables.
