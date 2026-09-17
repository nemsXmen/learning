---
id: typescript-09-as-const
title: as const
slug: as-const
technology: typescript
level: intermediate
module: 09-literal-types
order: 5
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-09-literal-unions]
skills: [literal-types]
tags: [typescript, as-const, literals]
---

## Objectifs

- Utiliser l’assertion `as const`
- Comprendre l’effet sur les littéraux et les objets
- Obtenir des types readonly et littéraux précis

## Introduction

`as const` demande à TypeScript l’inférence la plus étroite possible.

## Concept

```ts
const status = "success"; 
// type: "success" (déjà précis avec const)

const statuses = ["idle", "loading", "success"] as const;
// type: readonly ["idle", "loading", "success"]
```

Sans `as const` :

```ts
const statuses = ["idle", "loading", "success"];
// type: string[]
```

Sur un objet :

```ts
const config = {
  host: "localhost",
  port: 3000
} as const;
// { readonly host: "localhost"; readonly port: 3000 }
```

## Exemple

```ts
const routes = {
  home: "/",
  about: "/about"
} as const;

type Route = (typeof routes)[keyof typeof routes]; // "/" | "/about"
```

## Comment ça fonctionne

`as const` :
- Convertit les littéraux en literal types (pas d’élargissement)
- Rend les propriétés et éléments `readonly`
- Produit des tuples readonly pour les tableaux

## Erreurs fréquentes

- Oublier `as const` quand on veut des literal types à partir d’un tableau/objet
- Croire que `as const` existe à runtime (c’est une assertion de compilation)

## À retenir

- `as const` = inférence maximale + readonly
- Idéal pour les configs, routes, constantes
- Base pour dériver des unions via `typeof`

## Exercices

1. Déclare un tableau de thèmes avec `as const` et dérive le type d’union.

   :::solution
   ```ts
   const themes = ["light", "dark"] as const;
   type Theme = (typeof themes)[number]; // "light" | "dark"
   ```
   :::

## Questions d'entretien

1. À quoi sert `as const` ?

   :::reponse
   À demander l’inférence la plus précise possible : les valeurs restent des literal types et les structures deviennent readonly. C’est très utile pour les constantes et pour dériver des unions de types.
   :::
