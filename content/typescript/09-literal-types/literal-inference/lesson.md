---
id: typescript-09-literal-inference
title: Literal inference
slug: literal-inference
technology: typescript
level: intermediate
module: 09-literal-types
order: 8
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-09-const-assertions]
skills: [literal-types]
tags: [typescript, inference, literals]
---

## Objectifs

- Comprendre quand TypeScript infère des literal types
- Voir l’effet de `let` vs `const`
- Contrôler l’inférence avec `as const` et les annotations

## Introduction

L’inférence de littéraux dépend du contexte (`let`/`const`, position, annotations).

## Concept

```ts
const a = "hello"; // type: "hello"
let b = "hello";   // type: string

const n = 42;      // type: 42
let m = 42;        // type: number
```

Dans les objets :

```ts
const obj = { status: "ok" };
// status: string (élargissement par défaut)

const obj2 = { status: "ok" as const };
// status: "ok"
```

Ou :

```ts
const obj3 = { status: "ok" } as const;
```

## Exemple

```ts
function handle(status: "success" | "error") {}
const s = "success";
handle(s); // OK car s est "success"
```

## Comment ça fonctionne

Avec `const`, TypeScript peut inférer le littéral exact. Avec `let`, il élargit car la variable peut être réassignée. `as const` force le comportement littéral même dans les structures.

## Erreurs fréquentes

- S’étonner que `let x = "a"` soit `string`
- Oublier `as const` pour les configs

## À retenir

- `const` → souvent literal
- `let` → type élargi
- `as const` → contrôle total de l’inférence

## Exercices

1. Explique la différence de type entre `const x = "a"` et `let y = "a"`.

   :::solution
   `x` a le type `"a"`. `y` a le type `string` car il peut être réassigné.
   :::

## Questions d'entretien

1. Pourquoi `const x = "hello"` a-t-il un type plus précis que `let x = "hello"` ?

   :::reponse
   Parce que `const` ne peut pas être réassigné, TypeScript peut inférer le literal type exact `"hello"`. Avec `let`, la variable peut recevoir d’autres strings, donc le type est élargi à `string`.
   :::
