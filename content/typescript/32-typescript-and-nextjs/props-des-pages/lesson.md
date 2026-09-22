---
id: typescript-32-props-des-pages
title: Props des pages
slug: props-des-pages
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-32-app-router]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Typer les props reçues par page.tsx
- Voir params et searchParams
- Anticiper les APIs async (Next 15+)

## Introduction

Les pages App Router reçoivent des props liées à la route.

## Concept

```tsx
type PageProps = {
  params: Promise<{ slug: string }>; // selon version Next
  searchParams: Promise<{ q?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q } = await searchParams;
  return <div>{slug}</div>;
}
```

> Selon la version de Next, params/searchParams peuvent être synchrones ou en Promise.

## Exemple

Toujours vérifier la doc de la version utilisée pour le typage exact.

## Comment ça fonctionne

Next injecte ces props. TypeScript les valide si on annote le composant page.

## Erreurs fréquentes

- Typer params comme string au lieu d’objet
- Ignorer le caractère async éventuel

## À retenir

- Annoter PageProps
- params / searchParams
- Suivre la version Next

## Exercices

1. Esquisse PageProps avec params.slug: string (sync).

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type PageProps = { params: { slug: string } };
   ```
   :::

## Questions d'entretien

1. Comment types-tu les props d’une page App Router ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un type dédié incluant `params` et éventuellement `searchParams`, en respectant la forme (objet, Promise selon version Next) documentée pour la version du framework.
   :::
