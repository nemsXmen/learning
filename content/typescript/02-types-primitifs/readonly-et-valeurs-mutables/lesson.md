---
id: typescript-02-readonly-et-valeurs-mutables
title: readonly et valeurs mutables
slug: readonly-et-valeurs-mutables
technology: typescript
level: beginner
module: 02-types-primitifs
order: 14
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-02-annotations-explicites]
skills: [primitive-types]
tags: [typescript, readonly, primitifs]
---

## Objectifs

- Comprendre le modificateur `readonly` sur les primitifs et tableaux
- Distinguer immutabilité de type et immutabilité de valeur
- Savoir quand utiliser `readonly`

## Introduction

TypeScript permet d’exprimer l’intention d’immutabilité avec `readonly`. Attention : cela reste une protection *à la compilation*, pas à runtime.

## Concept

### Sur les propriétés

```ts
interface Config {
  readonly apiUrl: string;
}

const config: Config = { apiUrl: "https://api.example.com" };
// config.apiUrl = "autre"; // ❌ Cannot assign to 'apiUrl' because it is a read-only property
```

### Sur les tableaux

```ts
let nums: readonly number[] = [1, 2, 3];
// nums.push(4); // ❌
// nums[0] = 99; // ❌
```

Équivalent : `ReadonlyArray<number>`.

### Primitifs

Les primitifs (`string`, `number`, `boolean`…) sont déjà immuables en JavaScript. `readonly` n’a de sens que sur les propriétés d’objets ou les tableaux.

## Exemple

```ts
function printConfig(config: { readonly host: string; readonly port: number }) {
  console.log(`${config.host}:${config.port}`);
}
```

## Comment ça fonctionne

`readonly` empêche la réaffectation et les mutations au niveau du type-checker. À runtime le JavaScript reste mutable : ce n’est pas une vraie immutabilité profonde.

## Erreurs fréquentes

- Croire que `readonly` protège à runtime
- Oublier que les objets imbriqués restent mutables (il faut `Readonly` en profondeur)
- Utiliser `const` en pensant que cela rend l’objet immuable (const empêche seulement la réaffectation de la variable)

## À retenir

- `readonly` = intention d’immutabilité vérifiée à la compilation
- Utile pour les configs, les props React, les API publiques
- Ne remplace pas une vraie immutabilité runtime (structuredClone, bibliothèques…)

## Exercices

1. Déclare un tableau readonly de strings et essaie de le modifier (observe l’erreur).

   :::solution
   ```ts
   const tags: readonly string[] = ["ts", "js"];
   // tags.push("py"); // Erreur
   ```
   :::

## Questions d'entretien

1. `readonly` garantit-il l’immutabilité à runtime ?

   :::reponse
   Non. C’est uniquement une protection au niveau du type-checker. Le JavaScript généré reste mutable. Pour une immutabilité runtime il faut d’autres techniques (Object.freeze, structures persistantes, etc.).
   :::
