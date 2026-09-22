---
id: typescript-32-fullstack-typescript
title: Fullstack TypeScript
slug: fullstack-typescript
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 14
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-32-variables-denvironnement]
skills: [nextjs]
tags: [typescript, nextjs, fullstack]
---

## Objectifs

- Voir Next comme stack fullstack TS
- Partager des types entre UI et serveur
- Poser les frontières de validation

## Introduction

Next.js permet une app **fullstack TypeScript** : UI, actions, route handlers, data.

## Concept

```
shared/
  types/user.ts      # type User
  schemas/user.ts    # Zod schema → type
app/
  (actions)/user.ts  # server actions
  api/users/route.ts
  users/page.tsx     # server component
```

## Exemple

Un schema Zod unique génère le type et valide actions + API + forms.

## Comment ça fonctionne

Monorepo léger dans le même projet : types partagés, validation aux bords, UI consommateur de types stables.

## Erreurs fréquentes

- Dupliquer les types client/serveur
- Faire confiance au réseau sans schema

## À retenir

- Types + schemas partagés
- Validation aux frontières
- Server Components + Actions + Handlers
- Une seule langue : TypeScript

## Exercices

1. Où placer un type User partagé page + action ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Dans un module shared/types ou shared/schemas (inféré depuis Zod).
   :::

## Questions d'entretien

1. Comment partages-tu les types entre front et back dans Next.js ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Via des modules partagés (types/schemas) importés par les Server Components, Server Actions et Route Handlers. Un schema Zod unique évite la dérive et valide les entrées.
   :::
