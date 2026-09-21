---
id: typescript-06-alias-objets
title: Alias d’objets
slug: alias-objets
technology: typescript
level: beginner
module: 06-type-aliases
order: 2
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-06-introduction-a-type]
skills: [type-aliases]
tags: [typescript, type-aliases, objects]
---

## Objectifs

- Créer des type aliases pour des formes d’objets
- Les réutiliser dans plusieurs endroits
- Comparer brièvement avec les interfaces

## Introduction

Les objets sont le cas d’usage le plus fréquent des type aliases.

## Concept

```ts
type User = {
  id: number;
  name: string;
  email?: string;
};

function printUser(user: User) {
  console.log(user.name);
}
```

Tu peux composer :

```ts
type Admin = User & {
  permissions: string[];
};
```

## Exemple

```ts
type Product = {
  id: string;
  title: string;
  price: number;
};

const products: Product[] = [
  { id: "1", title: "Livre", price: 29 }
];
```

## Comment ça fonctionne

Le type alias d’objet se comporte comme une annotation inline, mais nommée et réutilisable. Le typage reste structurel.

## Erreurs fréquentes

- Recopier la même forme d’objet à plusieurs endroits
- Créer des aliases trop génériques (`type Data = object`)

## À retenir

- `type Nom = { ... }` pour les objets
- Réutilisable et documentant
- Composition possible avec `&` (intersection)

## Exercices

1. Crée un type `Address` avec `street` et `city`, puis un type `User` qui l’utilise.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Address = { street: string; city: string };
   type User = { name: string; address: Address };
   ```
   :::

## Questions d'entretien


1. Pourquoi préférer un type alias nommé à une annotation d’objet inline répétée ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Pour éviter la duplication, nommer clairement le concept métier, et faciliter les évolutions (un seul endroit à modifier).
   :::

