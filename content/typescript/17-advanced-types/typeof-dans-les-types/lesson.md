---
id: typescript-17-typeof-dans-les-types
title: typeof dans les types
slug: typeof-dans-les-types
technology: typescript
level: advanced
module: 17-advanced-types
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-17-keyof]
skills: [advanced-types]
tags: [typescript, typeof]
---

## Objectifs

- Utiliser `typeof` côté types (pas seulement runtime)
- Dériver un type depuis une valeur
- Le combiner avec `keyof` et `as const`

## Introduction

Dans une position de type, `typeof x` extrait le type de la valeur `x`.

## Concept

```ts
const config = {
  host: "localhost",
  port: 3000
} as const;

type Config = typeof config;
// { readonly host: "localhost"; readonly port: 3000 }

type ConfigKeys = keyof typeof config;
// "host" | "port"
```

## Exemple

```ts
function createUser() {
  return { id: 1, name: "Alice" };
}
type User = ReturnType<typeof createUser>;
```

## Comment ça fonctionne

`typeof` en position de type est purement compile-time. Il permet de ne pas dupliquer la forme d’une valeur dans un type séparé.

## Erreurs fréquentes

- Confondre `typeof` runtime et `typeof` type-level
- Oublier `as const` quand on veut des littéraux

## À retenir

- `typeof value` en annotation de type
- Excellent avec `as const` et `ReturnType`
- Une source de vérité : la valeur

## Exercices

1. À partir d’un objet `routes as const`, dérive le type des valeurs.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const routes = { home: "/", about: "/about" } as const;
   type Route = (typeof routes)[keyof typeof routes];
   ```
   :::

## Questions d'entretien

1. Quelle différence entre `typeof` en JavaScript et `typeof` dans un type TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En JavaScript, `typeof` est un opérateur runtime qui retourne une string (`"string"`, `"number"`, etc.). Dans un type TypeScript, `typeof x` extrait le type statique de la valeur `x` à la compilation.
   :::
