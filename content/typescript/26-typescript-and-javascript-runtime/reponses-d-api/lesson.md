---
id: typescript-26-reponses-d-api
title: Réponses d’API
slug: reponses-d-api
technology: typescript
level: intermediate
module: 26-typescript-and-javascript-runtime
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-26-json]
skills: [runtime]
tags: [typescript, api, runtime]
---

## Objectifs

- Sécuriser le typage des réponses HTTP
- Combiner fetch, unknown et schemas
- Gérer erreurs HTTP et forme de payload

## Introduction

Les réponses d’API sont la frontière runtime la plus courante.

## Concept

```ts
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  return UserSchema.parse(data);
}
```

## Exemple

OpenAPI / tRPC / contracts partagés réduisent l’écart, mais une validation reste utile en défense.

## Comment ça fonctionne

Status HTTP ≠ forme du body. Les deux doivent être gérés.

## Erreurs fréquentes

- `as User` sur res.json()
- Ignorer res.ok

## À retenir

- Check HTTP
- json → unknown → parse
- Contrats partagés + validation

## Exercices

1. Esquisse getUsers(): Promise<User[]> avec validation.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   async function getUsers(): Promise<User[]> {
     const res = await fetch("/api/users");
     if (!res.ok) throw new Error("fail");
     return UserListSchema.parse(await res.json());
   }
   ```
   :::

## Questions d'entretien

1. Comment types-tu une réponse fetch de façon sûre ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En vérifiant res.ok, en lisant le body comme unknown, puis en le validant avec un schema ou un type guard avant de le traiter comme T.
   :::
