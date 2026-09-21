---
id: typescript-18-readonly
title: Readonly
slug: 18-readonly
technology: typescript
level: intermediate
module: 18-utility-types
order: 3
estimatedMinutes: 8
difficulty: 2
xp: 35
prerequisites: [typescript-18-required]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `Readonly<T>`
- Rendre toutes les propriétés readonly
- Comprendre la profondeur (superficielle)

## Introduction

`Readonly<T>` ajoute `readonly` à chaque propriété de `T`.

## Concept

```ts
type User = { id: number; name: string };
type FrozenUser = Readonly<User>;
// { readonly id: number; readonly name: string }

const u: FrozenUser = { id: 1, name: "Alice" };
// u.name = "Bob"; // ❌
```

## Exemple

Utile pour les configs et les objets immuables au niveau des types.

## Comment ça fonctionne

Équivalent à `{ readonly [K in keyof T]: T[K] }`. Ce n’est **pas** profond : les objets imbriqués restent mutables sauf DeepReadonly custom.

## Erreurs fréquentes

- Croire que Readonly est profond par défaut

## À retenir

- `Readonly<T>` = props non réassignables
- Superficiel
- Configs / états figés

## Exercices

1. Applique Readonly à un type Point `{ x: number; y: number }`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type FrozenPoint = Readonly<{ x: number; y: number }>;
   ```
   :::

## Questions d'entretien

1. Readonly est-il profond ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non, par défaut il est superficiel. Pour une immutabilité en profondeur, il faut un DeepReadonly récursif custom.
   :::
