---
id: typescript-32-nextjs-plus-typescript
title: Next.js + TypeScript
slug: nextjs-plus-typescript
technology: typescript
level: intermediate
module: 32-typescript-and-nextjs
order: 1
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-31-react-plus-typescript]
skills: [nextjs]
tags: [typescript, nextjs]
---

## Objectifs

- Créer un projet Next.js typé
- Voir la config TS fournie
- Comprendre le rôle de TypeScript dans Next

## Introduction

Next.js offre un support **TypeScript de premier choix** (App Router inclus).

## Concept

```bash
npx create-next-app@latest my-app --typescript
```

Génère `tsconfig.json`, types Next, structure `app/` ou `pages/`.

## Exemple

`next-env.d.ts` référence les types Next. Les imports d’images, CSS modules, etc. sont typés.

## Comment ça fonctionne

Next compile TypeScript via son toolchain. Le type-checking peut tourner avec `tsc --noEmit` en CI.

## Erreurs fréquentes

- Désactiver strict dans le tsconfig généré sans raison
- Mélanger pages router et app router sans stratégie

## À retenir

- create-next-app --typescript
- tsconfig prêt
- Types Next intégrés

## Exercices

1. Quelle flag active TypeScript avec create-next-app ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `--typescript` (ou le prompt interactif).
   :::

## Questions d'entretien

1. Next.js nécessite-t-il une config TypeScript manuelle complexe ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non : `create-next-app --typescript` fournit une base solide (tsconfig, next-env.d.ts). On affine ensuite (strict, paths).
   :::
