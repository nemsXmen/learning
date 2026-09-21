---
id: typescript-35-response-types
title: Response types
slug: response-types
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-35-request-types]
skills: [api]
tags: [typescript, api]
---

## Objectifs

- Typer les réponses succès
- Enveloppes data/meta
- Cohérence client/serveur

## Introduction

Les **response types** décrivent le JSON de succès.

## Concept

```ts
type UserResponse = {
  id: string;
  email: string;
  createdAt: string; // ISO
};

type ApiSuccess<T> = {
  data: T;
  meta?: { requestId: string };
};
```

## Exemple

```ts
type GetUserResponse = ApiSuccess<UserResponse>;
```

## Comment ça fonctionne

Le serveur sérialise vers ce shape. Le client type `await res.json()` après validation ou via client généré.

## Erreurs fréquentes

- Exposer l’entity DB complète
- Dates non normalisées (string vs Date)

## À retenir

- DTOs de sortie
- Enveloppes optionnelles
- Pas de fuite de champs internes

## Exercices

1. Type ListUsersResponse = { data: UserResponse[]; total: number }.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type ListUsersResponse = { data: UserResponse[]; total: number };
   ```
   :::

## Questions d'entretien

1. Pourquoi ne pas renvoyer l’entity ORM brute ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour contrôler les champs exposés (mots de passe hashés, colonnes internes), stabiliser le contrat public et découpler API et schéma de base.
   :::
