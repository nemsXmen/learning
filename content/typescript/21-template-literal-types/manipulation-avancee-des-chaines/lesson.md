---
id: typescript-21-manipulation-avancee-des-chaines
title: Manipulation avancée des chaînes
slug: manipulation-avancee-des-chaines
technology: typescript
level: advanced
module: 21-template-literal-types
order: 12
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-21-uncapitalize]
skills: [template-literal-types]
tags: [typescript, template-literal-types]
---

## Objectifs

- Combiner infer et template literals pour parser
- Split, extract, rewrite au niveau des types
- Rester pragmatique

## Introduction

Avec `infer` dans un template, on **parse** des strings au niveau des types.

## Concept

```ts
type Split<S extends string, D extends string> =
  S extends `${infer H}${D}${infer R}`
    ? [H, ...Split<R, D>]
    : [S];

type Parts = Split<"a,b,c", ",">; // ["a", "b", "c"]
```

```ts
type ExtractRouteParams<R extends string> =
  R extends `${string}:${infer P}/${infer Rest}`
    ? P | ExtractRouteParams<Rest>
    : R extends `${string}:${infer P}`
      ? P
      : never;

type Params = ExtractRouteParams<"/users/:id/posts/:postId">;
// "id" | "postId"
```

## Exemple

Réécriture :

```ts
type Replace<S extends string, From extends string, To extends string> =
  S extends `${infer A}${From}${infer B}`
    ? `${A}${To}${Replace<B, From, To>}`
    : S;
```

## Comment ça fonctionne

Le motif `` `${infer A}...` `` capture des segments. La récursion permet de traiter toute la chaîne.

## Erreurs fréquentes

- Parsers trop ambitieux (maintenabilité)
- Profondeur excessive

## À retenir

- infer dans un template = parsing type-level
- Split / extract params / replace
- Puissant mais à doser

## Exercices

1. Extrais le premier segment avant `"/"` de `"users/123"`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type First<S extends string> =
     S extends `${infer H}/${string}` ? H : S;
   // First<"users/123"> = "users"
   ```
   :::

## Questions d'entretien

1. Comment parse-t-on une string au niveau des types en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En utilisant un conditional type avec un template literal et `infer` pour capturer des segments, éventuellement en récursion pour traiter toute la chaîne (split, extract de params, etc.).
   :::
