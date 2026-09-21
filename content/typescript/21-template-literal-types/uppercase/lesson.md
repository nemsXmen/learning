---
id: typescript-21-uppercase
title: Uppercase
slug: uppercase
technology: typescript
level: advanced
module: 21-template-literal-types
order: 8
estimatedMinutes: 8
difficulty: 1
xp: 30
prerequisites: [typescript-21-types-inspires-du-css]
skills: [template-literal-types]
tags: [typescript, template-literal-types]
---

## Objectifs

- Utiliser le utility type intrinsèque `Uppercase`
- Transformer des littéraux string
- Le combiner aux templates

## Introduction

`Uppercase<S>` convertit un type string en majuscules.

## Concept

```ts
type A = Uppercase<"hello">; // "HELLO"
type B = Uppercase<"foo" | "bar">; // "FOO" | "BAR"
```

## Exemple

```ts
type Env = "dev" | "prod";
type EnvLabel = Uppercase<Env>; // "DEV" | "PROD"
```

## Comment ça fonctionne

Utility intrinsèque TypeScript, purement type-level.

## Erreurs fréquentes

- L’appliquer à string large (reste string)

## À retenir

- `Uppercase<S>`
- Distribue sur les unions
- Labels, constantes, codes

## Exercices

1. Transforme `"ok"` en `"OK"` au niveau des types.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type T = Uppercase<"ok">; // "OK"
   ```
   :::

## Questions d'entretien

1. Que fait `Uppercase<S>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il produit un type string où tous les caractères de S sont en majuscules, en se distribuant sur les unions de littéraux.
   :::
