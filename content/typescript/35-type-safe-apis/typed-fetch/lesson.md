---
id: typescript-35-typed-fetch
title: Typed fetch
slug: typed-fetch
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-35-api-clients]
skills: [api]
tags: [typescript, api, fetch]
---

## Objectifs

- Envelopper fetch avec des types
- Gérer génériques de réponse
- Erreurs HTTP typées

## Introduction

`fetch` natif est peu typé : on l’**enveloppe**.

## Concept

```ts
async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
  schema?: { parse: (data: unknown) => T }
): Promise<T> {
  const res = await fetch(input, init);
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    throw Object.assign(new Error("HTTP error"), { status: res.status, data });
  }
  return schema ? schema.parse(data) : (data as T); // préférer schema
}
```

## Exemple

```ts
const user = await apiFetch(`/users/1`, undefined, UserSchema);
```

## Comment ça fonctionne

Le générique T + schema garantissent le type de retour après validation.

## Erreurs fréquentes

- data as T systématique
- Ignorer res.ok

## À retenir

- Wrapper fetch
- schema.parse
- Check res.ok

## Exercices

1. Pourquoi checker res.ok avant de parser en succès ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Parce qu’un 4xx/5xx peut aussi renvoyer du JSON d’erreur, pas le type succès T.
   :::

## Questions d'entretien

1. Comment types-tu fetch en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un wrapper générique qui vérifie `res.ok`, lit le body en unknown, valide via schema, et retourne `T`. Éviter `as T` seul.
   :::
