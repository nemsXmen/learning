---
id: typescript-32-metadata
title: Metadata
slug: metadata
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 11
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-32-middleware]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Typer metadata et generateMetadata
- SEO typé
- Metadata dynamique

## Introduction

Next type l’API **Metadata** pour les titres, descriptions, Open Graph, etc.

## Concept

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome"
};

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  return { title: params.slug };
}
```

## Exemple

Metadata est un type riche (openGraph, robots, alternates…).

## Comment ça fonctionne

Export statique `metadata` ou fonction `generateMetadata` async typée.

## Erreurs fréquentes

- Mauvais shape openGraph
- generateMetadata non async alors qu’on await

## À retenir

- type Metadata
- generateMetadata → Promise<Metadata>
- SEO type-safe

## Exercices

1. Exporte une metadata avec title "Blog".

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export const metadata: Metadata = { title: "Blog" };
   ```
   :::

## Questions d'entretien

1. Comment types-tu les métadonnées de page dans l’App Router ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec le type `Metadata` de `next`, via `export const metadata` ou `generateMetadata` retournant `Promise<Metadata>`.
   :::
