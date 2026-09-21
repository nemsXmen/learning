---
id: typescript-19-transformation-de-dto
title: Transformation de DTO
slug: transformation-de-dto
technology: typescript
level: advanced
module: 19-mapped-types
order: 10
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-19-deepreadonly]
skills: [mapped-types]
tags: [typescript, mapped-types, dto]
---

## Objectifs

- Appliquer les mapped types aux DTOs
- Dériver API input/output depuis un modèle
- Garder une source de vérité

## Introduction

Les mapped types excellent pour dériver des DTOs (Data Transfer Objects) depuis un modèle de domaine.

## Concept

```ts
type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

type UserPublic = Omit<User, "passwordHash">;
type UserCreate = Omit<User, "id" | "createdAt" | "passwordHash"> & {
  password: string;
};
type UserPatch = DeepPartial<UserPublic>;
```

Avec key remapping pour une API :

```ts
type ApiUser = {
  [K in keyof UserPublic as `user_${K}`]: UserPublic[K];
};
```

## Exemple

Une seule entité `User` alimente create / public / patch / api shapes.

## Comment ça fonctionne

Omit, Pick, Partial, DeepPartial et key remapping composent les variantes sans dupliquer les champs.

## Erreurs fréquentes

- Dupliquer manuellement les champs dans chaque DTO
- Laisser fuiter passwordHash dans un DTO public

## À retenir

- Source unique + transformations
- Mapped types + utility types
- Sécurité des données exposées

## Exercices

1. À partir d’un Product `{ id, name, price, internalCode }`, crée ProductPublic sans internalCode.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Product = { id: string; name: string; price: number; internalCode: string };
   type ProductPublic = Omit<Product, "internalCode">;
   ```
   :::

## Questions d'entretien

1. Comment utilises-tu les mapped types pour les DTOs ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En partant d’un modèle unique et en dérivant create/update/public/api via Omit, Pick, Partial, DeepPartial et éventuellement key remapping, pour éviter la duplication et garantir la cohérence des champs.
   :::
