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

Sorties structurées et contrats

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

## Exercices

- Le modèle produit un montant négatif alors que le métier l'interdit. Que fais-tu ?

:::indice
Le schéma seul ne suffit pas : il faut un invariant métier.
:::

:::solution
Rejeter la sortie, journaliser le cas et appliquer une stratégie contrôlée. Le modèle ne doit pas pouvoir contourner la règle métier en générant une autre valeur.
:::

## Erreurs fréquentes

Il est dangereux de laisser une sortie LLM déclencher directement un effet de bord. Pour une opération financière, ajoute autorisation indépendante, idempotency key et audit. Un retry aveugle peut également créer des doublons.

## À retenir

Une sortie LLM devient exploitable par le logiciel après validation, pas simplement après parsing.

## Introduction

Le fait qu'un modèle retourne du JSON ne signifie pas que l'application peut lui faire confiance. Une sortie peut être syntaxiquement correcte mais violer les contraintes du métier.

## Concept

Le contrat doit définir la structure attendue, les types, les champs obligatoires et les invariants métier. La validation runtime constitue la frontière déterministe entre la génération et le reste de l'application.

## Exemple

Supposons que le modèle retourne un montant négatif dans un objet JSON parfaitement valide. Le parseur réussit, mais le système doit refuser la valeur avant toute écriture ou opération externe.

## Comment ça fonctionne

Le flow est : LLM → parse → validation du schéma → validation métier → retry/fallback → exécution. En TypeScript, un schéma Zod peut effectuer la validation runtime. Si la sortie est invalide, la stratégie doit être explicite : retry limité, réparation contrôlée, fallback ou erreur.

## Questions d'entretien

Pourquoi ne jamais exécuter directement une sortie LLM ?

:::indice
Relie ta réponse à la frontière entre modèle et application.
:::

:::reponse
Parce qu'une sortie probabiliste peut être invalide ou malveillante et que le modèle n'est pas une frontière d'autorisation.
:::
