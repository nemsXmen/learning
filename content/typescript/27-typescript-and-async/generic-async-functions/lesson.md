---
id: typescript-27-generic-async-typescript-basics
title: Generic async typescript-basics
slug: generic-async-typescript-basics
technology: typescript
level: intermediate
module: 27-typescript-and-async
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-27-types-des-fonctions-async]
skills: [async]
tags: [typescript, async, generics]
---

## Objectifs

- Écrire des fonctions async génériques
- Propager T à travers Promise
- Typer fetch-like helpers

## Introduction

Les generics se combinent naturellement avec async/Promise.

## Concept

```ts
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP error");
  return (await res.json()) as T; // idéalement valider
}

const user = await getJson<User>("/api/user");
```

## Exemple

```ts
async function mapAsync<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>
): Promise<U[]> {
  return Promise.all(items.map(fn));
}
```

## Comment ça fonctionne

`T` paramètre le type de succès de la Promise retournée. L’appelant spécifie ou laisse inférer T.

## Erreurs fréquentes

- as T sans validation sur json()
- Perdre T en retournant Promise<any>

## À retenir

- async function f<T>(...): Promise<T>
- Helpers API génériques
- Valider quand même les données externes

## Exercices

1. Écris identityAsync<T>(value: T): Promise<T>.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   async function identityAsync<T>(value: T): Promise<T> {
     return value;
   }
   ```
   :::

## Questions d'entretien

1. Comment types-tu un helper getJson générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `async function getJson<T>(url: string): Promise<T>` — T est le type attendu de la réponse. En pratique on valide le JSON plutôt que de se contenter d’un cast.
   :::
