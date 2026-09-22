---
id: typescript-35-contract-first-development
title: Contract-first development
slug: contract-first-development
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-35-http-clients-types]
skills: [api]
tags: [typescript, api]
---

## Objectifs

- Comprendre l’approche contract-first
- Contraster avec code-first
- Voir les bénéfices TypeScript

## Introduction

**Contract-first** : on définit le contrat (OpenAPI, schema) avant ou comme source de vérité du code.

## Concept

1. Écrire/ouvrir la spec (OpenAPI, GraphQL SDL, schemas Zod partagés)
2. Générer types + clients + stubs serveur
3. Implémenter en respectant le contrat
4. Valider runtime + tests de contrat

## Exemple

Code-first (Nest décorateurs → plugin OpenAPI) vs contract-first (spec → codegen).

## Comment ça fonctionne

Le contrat guide front et back. TypeScript consomme les artefacts générés.

## Erreurs fréquentes

- Spec morte non régénérée
- Exceptions non documentées

## À retenir

- Spec comme source
- Codegen
- Validation + tests

## Exercices

1. Différence contract-first vs code-first ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Contract-first : spec d’abord, code généré/aligné. Code-first : code d’abord, spec dérivée.
   :::

## Questions d'entretien

1. Quand préfères-tu contract-first ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Quand plusieurs clients (web, mobile, partenaires) doivent s’aligner, ou quand le contrat est négocié avant l’implémentation. Code-first peut aller plus vite pour une API interne mono-équipe.
   :::
