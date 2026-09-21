---
id: typescript-32-search-params
title: Search params
slug: search-params
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 5
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-32-route-params]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Typer searchParams
- Gérer string | string[] | undefined
- Parser les query strings

## Introduction

Les **search params** (`?q=...&page=2`) sont exposés aux pages.

## Concept

```tsx
type Props = {
  searchParams: { q?: string; page?: string };
};

export default function SearchPage({ searchParams }: Props) {
  const q = searchParams.q ?? "";
  const page = Number(searchParams.page ?? "1");
  return <div>Results for {q}</div>;
}
```

## Exemple

Côté client : `useSearchParams()` de `next/navigation` (Client Component).

## Comment ça fonctionne

Les valeurs sont des strings. Clés absentes → undefined. Doublons possibles → string[].

## Erreurs fréquentes

- Assumer number
- Oublier undefined

## À retenir

- string | undefined
- Parser / valider
- useSearchParams côté client

## Exercices

1. Lis un searchParam sort avec défaut "asc".

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const sort = searchParams.sort ?? "asc";
   ```
   :::

## Questions d'entretien

1. Pourquoi les search params ne sont-ils pas typés number nativement ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que l’URL ne transporte que des strings. La sémantique number/boolean/enum est une interprétation applicative à valider.
   :::
