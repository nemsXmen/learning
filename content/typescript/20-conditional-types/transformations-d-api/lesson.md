---
id: typescript-20-transformations-d-api
title: Transformations d’API
slug: transformations-d-api
technology: typescript
level: advanced
module: 20-conditional-types
order: 9
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-20-utility-types-personnalises]
skills: [conditional-types]
tags: [typescript, conditional-types, api]
---

## Objectifs

- Appliquer les conditionals aux types d’API
- Dériver input/output depuis une définition unique
- Typer des clients HTTP de façon sûre

## Introduction

Les conditional types permettent de dériver les types de requêtes et réponses d’API.

## Concept

```ts
type Endpoint = {
  "/users": { method: "GET"; response: User[] };
  "/users/:id": { method: "GET"; response: User; params: { id: string } };
  "/users": { method: "POST"; body: CreateUser; response: User };
};

type ResponseOf<Path extends keyof Endpoint> = Endpoint[Path]["response"];
type BodyOf<Path extends keyof Endpoint> =
  Endpoint[Path] extends { body: infer B } ? B : never;
```

## Exemple

```ts
async function api<P extends keyof Endpoint>(
  path: P
): Promise<ResponseOf<P>> {
  // ...
  return {} as ResponseOf<P>;
}
```

## Comment ça fonctionne

Une map d’endpoints + conditionals/infer pour extraire body, params, response selon la présence des champs.

## Erreurs fréquentes

- Dupliquer les types de réponse manuellement
- Perdre le lien path → response

## À retenir

- Source unique d’endpoints
- Conditionals pour champs optionnels (body, params)
- Clients API ultra-typés

## Exercices

1. Extrais le type `body` s’il existe, sinon never.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type BodyOf<E> = E extends { body: infer B } ? B : never;
   ```
   :::

## Questions d'entretien

1. Comment types-tu un client API à partir d’une map d’endpoints ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En définissant une map path → { method, body?, params?, response }, puis en utilisant des conditional types et infer pour extraire les pièces selon le path, afin que les appels soient typés précisément.
   :::
