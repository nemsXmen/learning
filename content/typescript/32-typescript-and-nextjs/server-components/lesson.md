---
id: typescript-32-server-components
title: Server Components
slug: server-components
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-32-search-params]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Comprendre les Server Components (RSC)
- Typer async server components
- Savoir ce qui est interdit côté serveur

## Introduction

Par défaut, les composants `app/` sont des **Server Components**.

## Concept

```tsx
async function Users() {
  const users = await db.user.findMany(); // accès serveur
  return <ul>{users.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

Pas de useState / useEffect dans un Server Component.

## Exemple

On peut await directement dans le composant (fonction async).

## Comment ça fonctionne

Exécution serveur uniquement. Le HTML (ou payload RSC) est envoyé au client. TypeScript type le retour JSX et les données await.

## Erreurs fréquentes

- Hooks client dans un Server Component
- Passer des fonctions non sérialisables au client sans precaution

## À retenir

- async Server Components OK
- Pas de hooks client
- Idéal data fetching

## Exercices

1. Un Server Component peut-il être async ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Oui.
   :::

## Questions d'entretien

1. Quelle différence majeure Server vs Client Components pour TypeScript/React ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les Server Components peuvent être async et accéder aux ressources serveur, mais n’utilisent pas les hooks client (useState, useEffect…). Les Client Components sont interactifs et marqués `"use client"`.
   :::
