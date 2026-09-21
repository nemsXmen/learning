---
id: ai-06-structured-output
title: "Sorties structurées et contrats de données"
slug: structured-output
technology: ai-engineering
level: intermediate
module: llm-engineering
order: 2
estimatedMinutes: 65
difficulty: 4
xp: 140
prerequisites: [ai-06-prompting]
skills: [ai-llm-apps]
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


## Introduction

Une sortie structurée rend l'interface du modèle exploitable par du logiciel.

## Concept

JSON syntaxiquement valide ne signifie pas données correctes ; un schéma runtime reste nécessaire.

## Exemple

Valider un objet avec Zod avant toute écriture en base sépare génération et exécution.

## Comment ça fonctionne

génération → parse → schema validation → retry/fallback → exécution

## Questions d'entretien

- Pourquoi ne jamais exécuter directement une sortie LLM ?

  :::indice
  Considère toujours la frontière entre génération et logique déterministe.
  :::

  :::reponse
  Parce que le modèle n'est pas une frontière d'autorisation et sa sortie peut être invalide ou malveillante.
  :::
