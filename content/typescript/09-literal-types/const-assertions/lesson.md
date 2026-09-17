---
id: typescript-09-const-assertions
title: Const assertions
slug: const-assertions
technology: typescript
level: intermediate
module: 09-literal-types
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-09-readonly-tuples]
skills: [literal-types]
tags: [typescript, as-const]
---

## Objectifs

- Approfondir les const assertions (`as const`)
- Voir les effets sur objets, tableaux et expressions
- Les combiner avec `typeof`

## Introduction

`as const` est une **const assertion** : elle fige les types au niveau le plus précis.

## Concept

```ts
// Objet
const conf = { mode: "prod", retries: 3 } as const;

// Tableau → tuple readonly
const arr = [1, 2, 3] as const;

// Expression
let x = "hello" as const; // type "hello"
```

## Exemple – dériver une union

```ts
const METHODS = ["GET", "POST", "PUT"] as const;
type Method = (typeof METHODS)[number]; // "GET" | "POST" | "PUT"
```

## Comment ça fonctionne

La const assertion :
1. Empêche l’élargissement des littéraux
2. Ajoute `readonly` en profondeur (pour les structures)
3. Transforme les tableaux en tuples readonly

## Erreurs fréquentes

- Utiliser `as const` sur des valeurs qui doivent rester mutables / larges
- Oublier que c’est purement compile-time

## À retenir

- `as const` = précision maximale
- Pattern classique : constante + `(typeof x)[number]`
- Indispensable pour les configs typées

## Exercices

1. À partir d’un objet `as const` de routes, dérive le type des valeurs.

   :::solution
   ```ts
   const routes = { home: "/", about: "/about" } as const;
   type RoutePath = (typeof routes)[keyof typeof routes];
   ```
   :::

## Questions d'entretien

1. Que signifie une const assertion en TypeScript ?

   :::reponse
   C’est l’utilisation de `as const` pour forcer l’inférence la plus étroite possible (literal types + readonly). Elle n’existe qu’à la compilation.
   :::
