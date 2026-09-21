---
id: typescript-32-app-router
title: App Router
slug: app-router
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-32-nextjs-plus-typescript]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Comprendre la structure `app/`
- Fichiers spéciaux typés (page, layout, loading…)
- Conventions de routing

## Introduction

L’**App Router** organise les routes via le système de fichiers sous `app/`.

## Concept

```
app/
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  blog/
    [slug]/
      page.tsx
```

```tsx
// app/page.tsx
export default function Home() {
  return <h1>Home</h1>;
}
```

## Exemple

Layouts imbriqués, route groups `(marketing)`, parallel routes…

## Comment ça fonctionne

Next mappe dossiers → URL. TypeScript type les composants exportés par défaut et les helpers (generateMetadata, etc.).

## Erreurs fréquentes

- Mauvais nom de fichier (Page.tsx vs page.tsx selon OS)
- Client/Server confus dès le début

## À retenir

- page.tsx / layout.tsx
- Dossiers = segments
- Conventions strictes

## Exercices

1. Où place-t-on la page d’accueil App Router ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `app/page.tsx`
   :::

## Questions d'entretien

1. Qu’est-ce que l’App Router dans Next.js ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le système de routing basé sur le dossier `app/`, avec des fichiers conventionnés (page, layout, loading, error…) et le support des Server Components par défaut.
   :::
