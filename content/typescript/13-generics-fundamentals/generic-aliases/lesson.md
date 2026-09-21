---
id: typescript-13-generic-aliases
title: Generic aliases
slug: generic-aliases
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-13-generic-interfaces]
skills: [generics]
tags: [typescript, generics, type-aliases]
---

## Objectifs

- Créer des type aliases génériques
- Les comparer aux interfaces génériques
- Voir des cas d’usage (Result, Nullable…)

## Introduction

Les type aliases acceptent aussi des paramètres de type.

## Concept

```ts
type Nullable<T> = T | null | undefined;
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

type StringDictionary = Record<string, string>;
type Dictionary<T> = Record<string, T>;
```

## Exemple

```ts
type AsyncData<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };
```

## Comment ça fonctionne

`type Nom<T> = ...` crée un alias paramétré. Idéal pour les unions, intersections et compositions avancées (là où l’interface est limitée).

## Erreurs fréquentes

- Utiliser une interface quand un alias d’union serait plus naturel
- Oublier les valeurs par défaut de paramètres quand c’est pertinent

## À retenir

- `type Foo<T> = ...`
- Parfait pour Result, Nullable, wrappers d’union
- Complémentaire des interfaces génériques

## Exercices

1. Crée un type `Maybe<T>` pour `T | null`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Maybe<T> = T | null;
   ```
   :::

## Questions d'entretien

1. Quand préfères-tu un type alias générique à une interface générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour les unions, intersections, tuples et compositions qui ne se limitent pas à une forme d’objet. Les interfaces restent idéales pour les contrats d’objets extensibles.
   :::
