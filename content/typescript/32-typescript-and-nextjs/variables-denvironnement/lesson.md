---
id: typescript-32-variables-denvironnement
title: Variables d’environnement
slug: 32-variables-denvironnement
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 13
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-32-forms]
skills: [nextjs]
tags: [typescript, nextjs, env]
---

## Objectifs

- Distinguer env serveur et publique
- Utiliser NEXT_PUBLIC_
- Valider au boot

## Introduction

Next sépare les variables **serveur** et **exposées au client**.

## Concept

```bash
DATABASE_URL=...          # serveur seulement
NEXT_PUBLIC_API_URL=...   # embarqué côté client
```

```ts
process.env.DATABASE_URL; // serveur
process.env.NEXT_PUBLIC_API_URL; // client + serveur
```

## Exemple

```ts
import { z } from "zod";
const env = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url()
}).parse(process.env);
```

## Comment ça fonctionne

Seules les clés `NEXT_PUBLIC_*` sont inlinées dans le bundle client. Le reste reste serveur.

## Erreurs fréquentes

- Secret sans préfixe exposé par erreur via NEXT_PUBLIC_
- Pas de validation

## À retenir

- NEXT_PUBLIC_ = public
- Secrets côté serveur
- Schema d’env

## Exercices

1. Quelle variable est exposée au navigateur ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Celles préfixées `NEXT_PUBLIC_`.
   :::

## Questions d'entretien

1. Comment évites-tu d’exposer un secret dans Next.js ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En ne le préfixant pas avec `NEXT_PUBLIC_`, en ne l’important que dans du code serveur, et en validant la config au démarrage.
   :::
