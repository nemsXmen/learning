---
id: typescript-41-factories-avancees
title: Factories avancées
slug: factories-avancees
technology: typescript
level: advanced
module: 41-advanced-generics
order: 10
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-41-invariance]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Factories génériques typées
- Inférer le produit
- Constraints sur le produit

## Introduction

Les **factories avancées** créent des objets en préservant des types précis.

## Concept

```ts
function createApiClient<TRoutes extends Record<string, unknown>>(
  routes: TRoutes
) {
  return {
    call<K extends keyof TRoutes>(key: K, payload: TRoutes[K]) {
      // ...
      return payload;
    }
  };
}

const api = createApiClient({
  createUser: {} as { email: string },
  getUser: {} as { id: string }
});
api.call("createUser", { email: "a@b.c" });
```

## Exemple

Factories de stores, de clients HTTP, de schemas.

## Comment ça fonctionne

Le générique capture la map de config et type les méthodes dérivées.

## Erreurs fréquentes

- Retour any
- Perte des littéraux de clés

## À retenir

- Config comme source de types
- keyof dérivé
- Inférence depuis l’arg

## Exercices

1. Pourquoi passer un objet routes à la factory ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour capturer TRoutes et typer call(key, payload) précisément.
   :::

## Questions d'entretien

1. Comment types-tu une factory qui dépend d’une config objet ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En inférant un générique depuis l’objet de config (`T extends Record<...>`), puis en dérivant les méthodes via `keyof T` et `T[K]`.
   :::
