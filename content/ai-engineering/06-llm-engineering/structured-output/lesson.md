---
id: ai-06-structured-output
title: "Sorties structurées et contrats de données"
slug: structured-output
technology: ai-engineering
level: intermediate
module: 06-llm-engineering
order: 2
estimatedMinutes: 65
difficulty: 4
xp: 140
prerequisites: [ai-06-prompting]
skills: [ai-llm-engineering]
tags: [llm, ai-engineering]
---


## Objectifs
- obtenir des sorties machine-readable ;
- valider schéma et invariants métier ;
- gérer les erreurs de sortie ;
- séparer génération et effet de bord.

## JSON ne suffit pas
Du JSON peut être syntaxiquement valide mais métierement faux.

```text
LLM -> parsing -> schema validation -> business validation -> application
```

## Validation
La sortie doit être validée côté serveur. Pour TypeScript, un schéma Zod peut servir de frontière déterministe.

```typescript
const parsed = schema.safeParse(modelOutput)
if (!parsed.success) {
  // retry contrôlé, fallback ou erreur
}
```

## Stratégie d'échec
Prévois retry limité, fallback, réponse partielle explicitement marquée ou erreur. Un retry aveugle augmente coûts et latence.

## Effets de bord
Si une sortie déclenche une action externe, utilise autorisation, idempotency key et audit avant l'exécution.

## Exercice
Le modèle produit un montant négatif alors que le métier l'interdit.

### Solution
Rejeter la sortie via un invariant métier, journaliser le cas puis appliquer une stratégie contrôlée.

## À retenir
Une sortie LLM devient fiable pour l'application seulement après validation déterministe.
