---
id: typescript-14-pagination-generique
title: Pagination générique
slug: pagination-generique
technology: typescript
level: intermediate
module: 14-generics-advanced
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 50
prerequisites: [typescript-14-api-responses-generiques]
skills: [generics]
tags: [typescript, generics, pagination]
---

## Objectifs

- Typer une page de résultats générique
- Modéliser cursor / offset
- Réutiliser le pattern

## Introduction

La pagination est un autre cas classique de generic.

## Concept

```ts
type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};
```

## Exemple

```ts
async function listUsers(page: number): Promise<Page<User>> {
  // ...
  return { items: [], total: 0, page, pageSize: 20, hasMore: false };
}
```

## Comment ça fonctionne

`T` est le type des éléments de la page. Les métadonnées de pagination restent partagées.

## Erreurs fréquentes

- Dupliquer un type Page par entité
- Oublier `hasMore` / cursor

## À retenir

- `Page<T>` / `CursorPage<T>`
- Un seul type pour toutes les listes paginées
- Clair et réutilisable

## Exercices

1. Déclare un type `Page<T>` avec `items` et `total`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Page<T> = { items: T[]; total: number };
   ```
   :::

## Questions d'entretien

1. Comment types-tu une réponse paginée de façon générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un type `Page<T>` (ou `CursorPage<T>`) contenant les éléments typés `T[]` et les métadonnées de pagination (total, page, cursor…). Le même type sert pour toutes les ressources.
   :::
