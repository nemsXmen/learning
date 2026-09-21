---
id: typescript-35-error-types
title: Error types
slug: error-types
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-35-response-types]
skills: [api]
tags: [typescript, api, errors]
---

## Objectifs

- Typer les erreurs API
- Codes + body d’erreur stables
- Union de résultats côté client

## Introduction

Les **erreurs** font partie du contrat autant que les succès.

## Concept

```ts
type ApiError = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
};

type Result<T, E = ApiError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

## Exemple

```ts
// 404
{ statusCode: 404, code: "USER_NOT_FOUND", message: "User not found" }
```

## Comment ça fonctionne

Le client peut typer `Promise<Result<User>>` ou mapper status HTTP → erreurs discriminées.

## Erreurs fréquentes

- Messages libres non structurés
- Stack traces en prod

## À retenir

- code machine + message
- Format stable
- Result / unions

## Exercices

1. Esquisse un body 400 de validation.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   { statusCode: 400, code: "VALIDATION_ERROR", message: "...", details: [...] }
   ```
   :::

## Questions d'entretien

1. Comment types-tu les erreurs d’une API TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un format d’erreur stable (statusCode, code, message, details), des codes machine documentés, et côté client des unions Result ou des handlers par status.
   :::
