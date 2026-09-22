---
id: typescript-21-lowercase
title: Lowercase
slug: lowercase
technology: typescript
level: advanced
module: 21-template-literal-types
order: 9
estimatedMinutes: 8
difficulty: 1
xp: 30
prerequisites: [typescript-21-uppercase]
skills: [template-literal-types]
tags: [typescript, template-literal-types]
---

## Objectifs

- Utiliser `Lowercase`
- Normaliser des littéraux
- Cas d’usage (codes, slugs)

## Introduction

`Lowercase<S>` convertit en minuscules.

## Concept

```ts
type A = Lowercase<"HELLO">; // "hello"
type B = Lowercase<"Foo" | "Bar">; // "foo" | "bar"
```

## Exemple

```ts
type Status = "OK" | "Error";
type StatusSlug = Lowercase<Status>; // "ok" | "error"
```

## Comment ça fonctionne

Comme Uppercase, intrinsèque et distributif.

## Erreurs fréquentes

- Mélanger Lowercase et des comparaisons runtime non alignées

## À retenir

- `Lowercase<S>`
- Normalisation de codes
- Pair avec Uppercase

## Exercices

1. Passe `"Admin"` en `"admin"` au niveau des types.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type T = Lowercase<"Admin">;
   ```
   :::

## Questions d'entretien

1. À quoi sert `Lowercase` dans un design de types ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À normaliser des littéraux (codes, slugs, identifiants) en minuscules de façon type-safe et distribuée sur les unions.
   :::
