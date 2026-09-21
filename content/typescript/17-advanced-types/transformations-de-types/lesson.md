---
id: typescript-17-transformations-de-types
title: Transformations de types
slug: transformations-de-types
technology: typescript
level: advanced
module: 17-advanced-types
order: 11
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-17-type-level-programming]
skills: [advanced-types]
tags: [typescript, advanced-types]
---

## Objectifs

- Composer des transformations de types
- Réutiliser les utilitaires standards
- Créer des helpers métier

## Introduction

On enchaîne souvent plusieurs transformations pour obtenir le type final souhaité.

## Concept

```ts
type User = {
  id: number;
  name: string;
  password: string;
  createdAt: Date;
};

type PublicUser = Omit<User, "password">;
type UserPreview = Pick<PublicUser, "id" | "name">;
type ReadonlyPreview = Readonly<UserPreview>;
```

```ts
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
```

## Exemple

```ts
type ApiUser = {
  [K in keyof PublicUser as `user_${K}`]: PublicUser[K];
};
// key remapping
```

## Comment ça fonctionne

Chaque utilitaire (Pick, Omit, Partial, Readonly, Exclude…) est une transformation. On les compose librement. Le key remapping (`as`) permet de renommer les clés.

## Erreurs fréquentes

- Chaînes de transformations illisibles
- Réinventer un utilitaire déjà fourni par TS

## À retenir

- Composer Pick / Omit / Partial / Readonly…
- Key remapping avec `as`
- Helpers métier nommés pour la clarté

## Exercices

1. À partir de User, crée un type sans password et avec toutes les props optionnelles.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type UserInput = Partial<Omit<User, "password">>;
   ```
   :::

## Questions d'entretien

1. Comment composes-tu des transformations de types en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En enchaînant les utilitaires (Omit, Pick, Partial, Readonly, Exclude…) et éventuellement des mapped types custom avec key remapping. On nomme les types intermédiaires pour garder la lisibilité.
   :::
