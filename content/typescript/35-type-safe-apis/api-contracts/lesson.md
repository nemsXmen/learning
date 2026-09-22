---
id: typescript-35-api-contracts
title: API contracts
slug: api-contracts
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [api]
tags: [typescript, api]
---

## Objectifs

- Définir ce qu’est un contrat d’API
- Voir le rôle des types dans le contrat
- Lier contrat et validation

## Introduction

Un **contrat d’API** décrit les requêtes, réponses et erreurs attendues entre client et serveur.

## Concept

Le contrat inclut :
- chemins et méthodes HTTP
- shapes de body / query / params
- shapes de réponses succès
- codes et shapes d’erreur
- auth, pagination, versioning

En TypeScript, ce contrat se matérialise par des **types** + **schemas** de validation.

## Exemple

```ts
// Contrat simplifié
type GetUser = {
  method: "GET";
  path: `/users/${string}`;
  response: User;
  errors: { 404: { message: string } };
};
```

## Comment ça fonctionne

Sans contrat explicite, front et back divergent. Les types partagés + validation runtime ancrent le contrat.

## Erreurs fréquentes

- Documenter seulement en prose non vérifiée
- Types client ≠ types serveur

## À retenir

- Contrat = shapes + comportement
- Types + schemas
- Une source de vérité

## Exercices

1. Cite 3 éléments d’un contrat d’API.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Méthode/chemin, body/query, réponse succès, erreurs, auth…
   :::

## Questions d'entretien

1. Qu’est-ce qu’un contrat d’API type-safe en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un ensemble de types (et idéalement schemas) partagés ou générés qui décrivent précisément requêtes, réponses et erreurs, avec validation runtime côté serveur pour garantir le respect du contrat.
   :::
