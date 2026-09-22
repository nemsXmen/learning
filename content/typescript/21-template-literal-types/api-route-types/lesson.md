---
id: typescript-21-api-route-types
title: API route types
slug: api-route-types
technology: typescript
level: advanced
module: 21-template-literal-types
order: 6
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-21-routes-types]
skills: [template-literal-types]
tags: [typescript, template-literal-types, api]
---

## Objectifs

- Typer des routes d’API REST
- Combiner méthode HTTP + path
- Lier path → réponse

## Introduction

On peut typer à la fois le verbe et le chemin d’une API.

## Concept

```ts
type Method = "GET" | "POST" | "PUT" | "DELETE";
type Path = "/users" | "/posts";
type ApiCall = `${Method} ${Path}`;
// "GET /users" | "GET /posts" | "POST /users" | ...
```

Avec une map plus riche :

```ts
type Api = {
  "GET /users": User[];
  "GET /users/:id": User;
  "POST /users": User;
};
type ApiResponse<R extends keyof Api> = Api[R];
```

## Exemple

Les clients type-safe (tRPC-like, openapi-typescript…) s’appuient sur ces idées.

## Comment ça fonctionne

Template pour les identifiants d’appel + mapped/indexed types pour les réponses.

## Erreurs fréquentes

- Méthode et path non liés
- Réponses en any

## À retenir

- Méthode + path typés
- Map d’appels → réponses
- Base des clients API typés

## Exercices

1. Crée un type pour `"GET /health"` | `"GET /version"`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type HealthApi = `GET /${"health" | "version"}`;
   ```
   :::

## Questions d'entretien

1. Comment types-tu les appels d’une API REST en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En combinant des literal unions pour méthodes et paths (souvent via template literals) et une map path/méthode → type de réponse, afin que chaque appel soit typé précisément.
   :::
