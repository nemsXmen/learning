---
id: typescript-04-objets-imbriques
title: Objets imbriqués
slug: objets-imbriques
technology: typescript
level: beginner
module: 04-objects
order: 5
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-04-proprietes-readonly]
skills: [objects]
tags: [typescript, objects, nested]
---

## Objectifs

- Typer des objets qui contiennent d’autres objets
- Organiser les types imbriqués proprement
- Éviter les types trop profonds illisibles

## Introduction

Les données réelles sont rarement plates. TypeScript gère très bien les objets imbriqués.

## Concept

```ts
type Address = {
  street: string;
  city: string;
};

type User = {
  id: number;
  name: string;
  address: Address;
};

const user: User = {
  id: 1,
  name: "Alice",
  address: {
    street: "1 rue de la Paix",
    city: "Paris"
  }
};
```

On peut aussi tout écrire inline, mais nommer les sous-types améliore la lisibilité.

## Exemple

```ts
function getCity(user: User): string {
  return user.address.city;
}
```

## Comment ça fonctionne

Chaque niveau est un type objet classique. TypeScript suit les accès `user.address.city` et vérifie chaque segment.

## Erreurs fréquentes

- Créer des types inline extrêmement profonds
- Oublier de typer un niveau intermédiaire
- Ne pas gérer le cas où un objet imbriqué est optionnel

## À retenir

- Les objets imbriqués se typent naturellement
- Préfère des types nommés pour chaque niveau significatif
- L’accès en chaîne est vérifié

## Exercices

1. Type un objet `Order` avec un `customer` qui a `name` et `email`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Customer = { name: string; email: string };
   type Order = { id: number; customer: Customer };
   ```
   :::

## Questions d'entretien


1. Comment évites-tu les types objets imbriqués illisibles ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   En extrayant chaque niveau significatif dans un type ou une interface nommée. Cela rend le code plus documenté et réutilisable.
   :::

