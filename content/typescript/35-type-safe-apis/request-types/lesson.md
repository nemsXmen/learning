---
id: typescript-35-request-types
title: Request types
slug: request-types
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 2
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-35-api-contracts]
skills: [api]
tags: [typescript, api]
---

## Objectifs

- Typer body, query et params
- Séparer les types d’entrée
- Préparer la validation

## Introduction

Les **request types** formalisent ce que le client envoie.

## Concept

```ts
type CreateUserRequest = {
  body: { email: string; password: string };
};

type ListUsersRequest = {
  query: { page?: number; q?: string };
};

type GetUserRequest = {
  params: { id: string };
};
```

## Exemple

Souvent dérivés d’un schema : `z.infer<typeof CreateUserBodySchema>`.

## Comment ça fonctionne

Le serveur valide que la requête réelle matche ces types. Le client les utilise pour construire les appels.

## Erreurs fréquentes

- Un seul type fourre-tout Request
- Oublier que query values sont des strings côté HTTP

## À retenir

- body / query / params séparés
- Inférence depuis schemas
- Strings HTTP → parse

## Exercices

1. Type body pour PATCH user : { name?: string }.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type PatchUserBody = { name?: string };
   ```
   :::

## Questions d'entretien

1. Pourquoi séparer types de body, query et params ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce qu’ils ont des sources, des contraintes et souvent des validations différentes. Les séparer clarifie le contrat et évite les objets fourre-tout.
   :::
