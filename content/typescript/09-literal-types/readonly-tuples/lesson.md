---
id: typescript-09-readonly-tuples
title: Readonly tuples
slug: readonly-tuples
technology: typescript
level: intermediate
module: 09-literal-types
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-09-as-const]
skills: [literal-types]
tags: [typescript, tuples, readonly]
---

## Objectifs

- Créer des tuples readonly
- Comprendre le lien avec `as const`
- Les utiliser pour des constantes ordonnées

## Introduction

Les tuples peuvent être rendus readonly, ce qui empêche toute mutation.

## Concept

```ts
const point: readonly [number, number] = [10, 20];
// point[0] = 5; // ❌
// point.push(30); // ❌
```

Avec `as const` :

```ts
const point = [10, 20] as const;
// type: readonly [10, 20]
```

## Exemple

```ts
const origin = [0, 0] as const;
type Origin = typeof origin; // readonly [0, 0]
```

## Comment ça fonctionne

`readonly [T, U]` retire les méthodes mutantes. Combiné à `as const`, on obtient des littéraux précis et immuables au niveau des types.

## Erreurs fréquentes

- Croire que readonly protège à runtime
- Muter via un cast ou une référence non readonly

## À retenir

- `readonly [T, U]` ou `as const` sur un tableau
- Utile pour les constantes ordonnées
- Protection de compilation

## Exercices

1. Déclare un tuple readonly RGB avec `as const`.

   :::solution
   ```ts
   const red = [255, 0, 0] as const;
   // type: readonly [255, 0, 0]
   ```
   :::

## Questions d'entretien

1. Comment obtient-on un tuple readonly avec des littéraux précis ?

   :::reponse
   En utilisant `as const` sur un tableau littéral, ou en annotant explicitement `readonly [Type1, Type2, ...]`.
   :::
