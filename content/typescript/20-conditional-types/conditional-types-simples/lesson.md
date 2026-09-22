---
id: typescript-20-conditional-types-simples
title: Conditional types simples
slug: conditional-types-simples
technology: typescript
level: advanced
module: 20-conditional-types
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-20-t-extends-u]
skills: [conditional-types]
tags: [typescript, conditional-types]
---

## Objectifs

- Écrire des conditional types simples
- Choisir entre deux types selon une condition
- Voir des exemples pratiques

## Introduction

Un conditional type sélectionne un type selon une condition d’assignabilité.

## Concept

```ts
type ApiResponse<T> = T extends Error
  ? { ok: false; error: T }
  : { ok: true; data: T };

type Ok = ApiResponse<string>;  // { ok: true; data: string }
type Err = ApiResponse<Error>;  // { ok: false; error: Error }
```

## Exemple

```ts
type MessageType<T extends string | number> = T extends string
  ? { kind: "text"; value: T }
  : { kind: "count"; value: T };
```

## Comment ça fonctionne

À la compilation, TypeScript évalue `T extends U` et sélectionne la branche correspondante.

## Erreurs fréquentes

- Conditions trop larges (toujours la même branche)
- Oublier que les unions se distribuent (voir leçon dédiée)

## À retenir

- `T extends U ? X : Y`
- Branche vraie / fausse
- Outil de sélection de types

## Exercices

1. Type `IsArray<T>` → true si T est un tableau, sinon false.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type IsArray<T> = T extends any[] ? true : false;
   ```
   :::

## Questions d'entretien

1. Donne un exemple simple de conditional type utile.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `type NonNullable<T> = T extends null | undefined ? never : T` — retire null et undefined d’une union.
   :::
