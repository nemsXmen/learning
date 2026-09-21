---
id: typescript-02-bigint
title: bigint
slug: bigint
technology: typescript
level: beginner
module: 02-types-primitifs
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-02-number]
skills: [primitive-types]
tags: [typescript, bigint, primitifs]
---

## Objectifs

- Comprendre le type `bigint`
- Savoir quand l’utiliser à la place de `number`
- Connaître la syntaxe des littéraux bigint

## Introduction

`bigint` permet de représenter des entiers de précision arbitraire, au-delà des limites de `number` (safe integer jusqu’à 2^53 - 1).

## Concept

```ts
let big: bigint = 100n;
let alsoBig: bigint = BigInt(100);
```

Le suffixe `n` crée un littéral bigint.

### Opérations

```ts
const a = 10n;
const b = 20n;
const sum = a + b; // 30n
```

On ne peut **pas** mélanger `bigint` et `number` dans les opérations arithmétiques :

```ts
// 10n + 20; // ❌ Operator '+' cannot be applied to types 'bigint' and 'number'
```

## Exemple

```ts
function factorial(n: bigint): bigint {
  if (n <= 1n) return 1n;
  return n * factorial(n - 1n);
}
```

## Comment ça fonctionne

`bigint` est un type primitif distinct de `number`. Il est supporté nativement par les runtimes modernes (Node, navigateurs récents).

## Erreurs fréquentes

- Mélanger `number` et `bigint` dans une expression
- Utiliser `bigint` pour de la monnaie (mieux vaut des bibliothèques ou des entiers en centimes)
- Oublier le `n` sur les littéraux

## À retenir

- `bigint` = entiers de taille arbitraire
- Suffixe `n` obligatoire pour les littéraux
- Pas de mélange avec `number` dans les opérations
- Utile pour la cryptographie, les grands compteurs, etc.

## Exercices

1. Déclare deux bigint et calcule leur produit.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   const a = 12345678901234567890n;
   const b = 2n;
   const product = a * b;
   ```
   :::

## Questions d'entretien


1. Quand utiliser `bigint` plutôt que `number` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Quand on a besoin d’entiers plus grands que Number.MAX_SAFE_INTEGER (2^53 - 1), par exemple en cryptographie, pour des IDs très grands ou des calculs d’entiers exacts de grande taille.
   :::

