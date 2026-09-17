---
id: typescript-06-alias-tableaux
title: Alias de tableaux
slug: alias-tableaux
technology: typescript
level: beginner
module: 06-type-aliases
order: 4
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-06-alias-fonctions]
skills: [type-aliases]
tags: [typescript, type-aliases, arrays]
---

## Objectifs

- Créer des type aliases pour des tableaux
- Les utiliser pour clarifier les listes métier

## Introduction

Nommer un tableau peut rendre le code plus expressif.

## Concept

```ts
type UserId = string;
type UserIds = UserId[];

type Scores = number[];
type Matrix = number[][];
```

Ou avec la forme générique :

```ts
type StringList = Array<string>;
```

## Exemple

```ts
type ProductId = string;
type Cart = ProductId[];

function addToCart(cart: Cart, id: ProductId): Cart {
  return [...cart, id];
}
```

## Comment ça fonctionne

L’alias n’est qu’un nom pour `T[]` (ou `Array<T>`). Il n’ajoute pas de comportement runtime.

## Erreurs fréquentes

- Créer des aliases inutiles pour des tableaux très génériques
- Oublier que le typage reste structurel

## À retenir

- `type Nom = T[]` pour nommer des listes
- Utile quand le tableau a un sens métier clair
- Reste un simple alias

## Exercices

1. Crée un type `Tags` pour un tableau de strings.

   :::solution
   ```ts
   type Tags = string[];
   ```
   :::

## Questions d'entretien

1. Quand est-il pertinent de créer un type alias pour un tableau ?

   :::reponse
   Quand la liste représente un concept métier clair (ex. UserIds, Tags, Cart) et que le nom améliore la lisibilité du code.
   :::
