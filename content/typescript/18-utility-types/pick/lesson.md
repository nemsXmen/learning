---
id: typescript-18-pick
title: Pick
slug: pick
technology: typescript
level: intermediate
module: 18-utility-types
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-18-readonly]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `Pick<T, K>`
- Extraire un sous-ensemble de propriétés
- Composer avec d’autres utilitaires

## Introduction

`Pick<T, K>` crée un type en sélectionnant certaines clés de `T`.

## Concept

```ts
type User = { id: number; name: string; email: string; password: string };
type PublicUser = Pick<User, "id" | "name" | "email">;
// { id: number; name: string; email: string }
```

## Exemple

```ts
function preview(user: Pick<User, "id" | "name">) {
  console.log(user.id, user.name);
}
```

## Comment ça fonctionne

`K` doit étendre `keyof T`. Équivalent à `{ [P in K]: T[P] }`.

## Erreurs fréquentes

- Lister une clé inexistante
- Oublier que K est une union de clés

## À retenir

- `Pick<T, K>` = sous-ensemble de props
- Vues / DTOs / previews
- Combinable avec Partial, Readonly…

## Exercices

1. Crée un type avec uniquement `id` et `title` d’un Article.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Article = { id: string; title: string; body: string };
   type ArticleMeta = Pick<Article, "id" | "title">;
   ```
   :::

## Questions d'entretien

1. À quoi sert `Pick<T, K>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À construire un type en ne gardant que certaines propriétés de T, spécifiées par l’union de clés K.
   :::
