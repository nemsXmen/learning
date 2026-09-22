---
id: typescript-14-api-responses-generiques
title: API responses génériques
slug: api-responses-generiques
technology: typescript
level: intermediate
module: 14-generics-advanced
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 50
prerequisites: [typescript-14-generic-services]
skills: [generics]
tags: [typescript, generics, api]
---

## Objectifs

- Typer les réponses d’API de façon générique
- Modéliser succès / erreur
- Réutiliser le même enveloppe

## Introduction

Les réponses HTTP se prêtent très bien aux generics.

## Concept

```ts
type ApiResponse<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number };

async function getJson<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  if (!res.ok) {
    return { ok: false, error: res.statusText, status: res.status };
  }
  const data = (await res.json()) as T;
  return { ok: true, data, status: res.status };
}
```

## Exemple

```ts
type User = { id: string; name: string };
const result = await getJson<User[]>("/api/users");
if (result.ok) {
  console.log(result.data.map(u => u.name));
}
```

## Comment ça fonctionne

`T` représente le payload de succès. L’union discriminée permet un narrowing propre.

## Erreurs fréquentes

- Typer toute la réponse en `any`
- Oublier le cas d’erreur

## À retenir

- `ApiResponse<T>` = enveloppe réutilisable
- Combiner avec discriminated unions
- Valider idéalement à runtime (Zod, etc.)

## Exercices

1. Déclare un type `ApiSuccess<T>` avec `data: T` et `status: number`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type ApiSuccess<T> = { data: T; status: number };
   ```
   :::

## Questions d'entretien

1. Comment types-tu une réponse d’API générique en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un type générique du style `ApiResponse<T>` (souvent une discriminated union succès/erreur) où `T` représente le payload. On combine cela avec le narrowing et idéalement une validation runtime.
   :::
