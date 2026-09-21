---
id: typescript-06-aliases-imbriques
title: Aliases imbriqués
slug: aliases-imbriques
technology: typescript
level: beginner
module: 06-type-aliases
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-06-union-avec-aliases]
skills: [type-aliases]
tags: [typescript, type-aliases]
---

## Objectifs

- Composer des type aliases qui en référencent d’autres
- Organiser des modèles de données en couches
- Éviter les structures trop profondes illisibles

## Introduction

Les type aliases se référencent facilement entre eux, ce qui permet de construire des modèles clairs.

## Concept

```ts
type Address = {
  street: string;
  city: string;
  zip: string;
};

type User = {
  id: number;
  name: string;
  address: Address;
};

type Order = {
  id: string;
  user: User;
  total: number;
};
```

## Exemple

```ts
type Coordinates = { lat: number; lng: number };
type Location = { name: string; coords: Coordinates };
```

## Comment ça fonctionne

Chaque alias peut utiliser d’autres aliases dans sa définition. TypeScript résout les références et vérifie la cohérence.

## Erreurs fréquentes

- Créer des chaînes d’imbrication trop profondes sans noms intermédiaires
- Références circulaires non gérées (voir types récursifs)

## À retenir

- Compose les aliases pour refléter le domaine
- Chaque niveau significatif mérite un nom
- La lisibilité prime sur la compacité

## Exercices

1. Crée `Name` (first + last), puis `Person` qui l’utilise avec un age.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Name = { first: string; last: string };
   type Person = { name: Name; age: number };
   ```
   :::

## Questions d'entretien


1. Comment organises-tu des types objets imbriqués avec des aliases ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   En extrayant chaque concept métier dans son propre type alias, puis en les composant. Cela rend le modèle lisible et maintenable.
   :::

