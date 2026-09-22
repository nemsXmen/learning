---
id: typescript-22-as-const
title: as const
slug: 22-as-const
technology: typescript
level: intermediate
module: 22-type-assertions
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-22-angle-bracket-assertions]
skills: [type-assertions]
tags: [typescript, as-const]
---

## Objectifs

- Utiliser `as const`
- Obtenir des littéraux readonly
- Éviter l’élargissement de types

## Introduction

`as const` est une assertion qui rend une valeur **readonly** et en **littéraux** les plus précis possibles.

## Concept

```ts
const roles = ["admin", "user"];
// string[]

const rolesConst = ["admin", "user"] as const;
// readonly ["admin", "user"]

const config = {
  host: "localhost",
  port: 3000
} as const;
// { readonly host: "localhost"; readonly port: 3000 }
```

## Exemple

```ts
const directions = ["up", "down", "left", "right"] as const;
type Direction = (typeof directions)[number]; // "up" | "down" | "left" | "right"
```

## Comment ça fonctionne

Sans `as const`, TypeScript élargit `"admin"` en `string`. Avec, on conserve le littéral et on applique readonly en profondeur sur l’expression.

## Erreurs fréquentes

- Oublier `as const` puis s’étonner d’avoir `string` au lieu de `"admin"`

## À retenir

- `as const` = littéraux + readonly
- Source de vérité pour des unions
- Très courant avec config et enums « maison »

## Exercices

1. Déclare un tableau de status avec as const et en dérive l’union.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const statuses = ["idle", "loading", "done"] as const;
   type Status = (typeof statuses)[number];
   ```
   :::

## Questions d'entretien

1. Que change `as const` sur un objet ou un tableau ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il empêche l’élargissement des littéraux (string → "hello") et rend la structure readonly, ce qui permet d’obtenir des unions précises via typeof.
   :::
