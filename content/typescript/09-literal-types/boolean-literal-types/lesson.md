---
id: typescript-09-boolean-literal-types
title: Boolean literal types
slug: boolean-literal-types
technology: typescript
level: beginner
module: 09-literal-types
order: 3
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-09-number-literal-types]
skills: [literal-types]
tags: [typescript, literals, boolean]
---

## Objectifs

- Comprendre `true` et `false` comme types
- Voir leur rôle dans l’inférence et les discriminants
- Les utiliser dans des unions

## Introduction

`true` et `false` sont aussi des literal types.

## Concept

```ts
type AlwaysTrue = true;
type Flag = true | false; // équivalent à boolean

let ok: true = true;
// ok = false; // ❌
```

Dans les discriminants :

```ts
type Result =
  | { ok: true; value: string }
  | { ok: false; error: string };
```

## Exemple

```ts
function assert(condition: true) {
  // condition est forcément true ici
}
```

## Comment ça fonctionne

TypeScript infère souvent `true` ou `false` avec `as const` ou sur des constantes. Ces littéraux servent de discriminants très efficaces.

## Erreurs fréquentes

- Annoter en `boolean` alors que `true` seul suffirait dans certains contextes

## À retenir

- `true` et `false` sont des types
- Très utiles comme discriminants (`ok: true` / `ok: false`)
- `true | false` ≡ `boolean`

## Exercices

1. Déclare un type Result avec un discriminant booléen `success`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type Result =
     | { success: true; data: string }
     | { success: false; error: string };
   ```
   :::

## Questions d'entretien


1. Pourquoi utilise-t-on parfois `true` ou `false` comme type plutôt que `boolean` ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Pour restreindre à une seule valeur (ex. une fonction qui n’accepte que `true`) ou comme discriminant dans une union (`ok: true` vs `ok: false`), ce qui permet un narrowing très précis.
   :::

