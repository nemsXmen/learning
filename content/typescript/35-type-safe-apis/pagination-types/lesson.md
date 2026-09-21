---
id: typescript-35-pagination-types
title: Pagination types
slug: pagination-types
technology: typescript
level: intermediate
module: 35-type-safe-apis
order: 5
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-35-error-types]
skills: [api]
tags: [typescript, api]
---

## Objectifs

- Typer offset/limit et cursor
- Réponses paginées génériques
- Cohérence des meta

## Introduction

La **pagination** a des shapes récurrents à typer une fois.

## Concept

```ts
type PageParams = {
  page?: number;
  pageSize?: number;
};

type CursorParams = {
  cursor?: string;
  limit?: number;
};

type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
};
```

## Exemple

```ts
type ListUsersResponse = Page<UserResponse>;
```

## Comment ça fonctionne

Génériques `Page<T>` réutilisables. Validation des bornes (pageSize max) côté serveur.

## Erreurs fréquentes

- pageSize non borné
- total optionnel incohérent

## À retenir

- Page<T> / CursorPage<T>
- Params validés
- Meta stable

## Exercices

1. Type Page<T> minimal items + total.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Page<T> = { items: T[]; total: number };
   ```
   :::

## Questions d'entretien

1. Offset vs cursor pagination côté types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Offset/page : meta numériques (page, pageSize, total). Cursor : token opaque `nextCursor`. Les types reflètent le modèle choisi pour éviter les mélanges.
   :::
