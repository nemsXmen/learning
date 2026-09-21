---
id: typescript-33-generics
title: Generics
slug: generics
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 9
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-33-interfaces]
skills: [nestjs]
tags: [typescript, nestjs, generics]
---

## Objectifs

- Appliquer les generics dans Nest
- Services / repositories génériques
- Réponses API typées

## Introduction

Les **generics** réduisent la duplication dans les couches data et API.

## Concept

```ts
@Injectable()
export class CrudService<T> {
  constructor(private readonly repo: Repository<T>) {}
  findAll(): Promise<T[]> {
    return this.repo.find();
  }
}
```

```ts
type ApiResponse<T> = {
  data: T;
  meta?: { total: number };
};
```

## Exemple

Pagination générique, base repository TypeORM/Prisma wrappers.

## Comment ça fonctionne

Même règles TypeScript : T paramètre les méthodes et retours. Attention aux limites de réflexion DI avec generics complexes.

## Erreurs fréquentes

- Sur-abstraire trop tôt
- Perdre le typage en any dans les bases génériques

## À retenir

- Generics pour CRUD / responses
- Garder T visible
- Ne pas sacrifier la clarté

## Exercices

1. Type Page<T> = { items: T[]; total: number }.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Page<T> = { items: T[]; total: number };
   ```
   :::

## Questions d'entretien

1. Où les generics aident-ils le plus dans Nest ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Sur les couches transverses : repositories/CRUD, wrappers de réponse API, pagination, caches typés — tout en gardant le type métier T.
   :::
