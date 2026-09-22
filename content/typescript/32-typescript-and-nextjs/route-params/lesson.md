---
id: typescript-32-route-params
title: Route params
slug: route-params
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 4
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-32-props-des-pages]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Typer les segments dynamiques
- Catch-all et optional catch-all
- Valider les params

## Introduction

Les **route params** viennent des dossiers `[slug]`, `[...slug]`, `[[...slug]]`.

## Concept

```tsx
// app/posts/[id]/page.tsx
type Props = { params: { id: string } };

export default function PostPage({ params }: Props) {
  return <article>{params.id}</article>;
}
```

```tsx
// app/docs/[...slug]/page.tsx
type Props = { params: { slug: string[] } };
```

## Exemple

Valider avec Zod si le param doit être un UUID / number.

## Comment ça fonctionne

Tout param de route est string (ou string[]) au niveau URL. La conversion métier est applicative.

## Erreurs fréquentes

- Number(params.id) sans check NaN
- Oublier string[] pour catch-all

## À retenir

- [id] → string
- [...slug] → string[]
- Valider avant usage métier

## Exercices

1. Type params pour app/shop/[category]/[item]/page.tsx.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Props = { params: { category: string; item: string } };
   ```
   :::

## Questions d'entretien

1. Quel est le type d’un param de route dynamique dans Next ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Une `string` (ou `string[]` pour les catch-all). Toute conversion (number, UUID) doit être faite et validée par l’application.
   :::
