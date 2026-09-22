---
id: typescript-35-api-clients
title: API clients
slug: api-clients
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-35-runtime-validation]
skills: [api]
tags: [typescript, api]
---

## Objectifs

- Typer un client d’API
- Centraliser base URL et headers
- Propagater les types de réponse

## Introduction

Un **API client** typé encapsule fetch/axios avec les types du contrat.

## Concept

```ts
async function getUser(id: string): Promise<UserResponse> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw await toApiError(res);
  return UserResponseSchema.parse(await res.json());
}
```

## Exemple

Classe ou module `api.users.get`, `api.users.create` avec types d’entrée/sortie.

## Comment ça fonctionne

Le client est le miroir du contrat côté consommateur. Validation optionnelle des réponses.

## Erreurs fréquentes

- json() as User sans parse
- Duplication d’URL et de types

## À retenir

- Fonctions typées par endpoint
- parse des réponses
- Erreurs mappées

## Exercices

1. Signature createUser(body: CreateUserDto): Promise<UserResponse>.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   async function createUser(body: CreateUserDto): Promise<UserResponse> {
     // fetch POST + parse
   }
   ```
   :::

## Questions d'entretien

1. Que contient un bon client d’API TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Des fonctions/méthodes par endpoint, types d’entrée/sortie du contrat, gestion d’erreur homogène, et idéalement validation des réponses (schema) pour détecter les drifts.
   :::
