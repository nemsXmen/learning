---
id: typescript-39-architecture-modulaire
title: Architecture modulaire
slug: architecture-modulaire
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 14
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-testabilite]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Découper par modules métier
- Alignement feature folders
- Éviter le monolithe de dossiers techniques seuls

## Introduction

Clean Architecture se combine bien avec un **découpage modulaire** (features).

## Concept

```
src/
  modules/
    users/
      domain/
      application/
      infra/
      presentation/
    orders/
      ...
  shared/
```

## Exemple

Chaque module expose une API publique minimale (facade). Les imports inter-modules sont contrôlés.

## Comment ça fonctionne

Vertical slices + couches internes. TypeScript paths / ESLint boundaries pour freiner les mauvais imports.

## Erreurs fréquentes

- Dossiers `controllers/`, `services/` globaux uniquement
- Cycles entre modules

## À retenir

- Features + couches
- API de module
- Règles d’import

## Exercices

1. Avantage d’un module users/ autonome ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Cohésion métier, ownership claire, moins de couplage accidental.
   :::

## Questions d'entretien

1. Clean Architecture vs architecture modulaire ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Compatible : chaque module métier peut appliquer domain/application/infra/presentation en interne, tout en limitant les dépendances entre modules via des APIs explicites.
   :::
