---
id: typescript-25-strict-null-checks
title: strictNullChecks
slug: strict-null-checks
technology: typescript
level: intermediate
module: 25-tsconfig
order: 7
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-25-no-implicit-any]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Activer `strictNullChecks`
- Traiter null et undefined comme distincts
- Forcer le narrowing

## Introduction

Avec `strictNullChecks`, `null` et `undefined` ne sont **pas** assignables aux autres types par défaut.

## Concept

```ts
let s: string = "hi";
// s = null; // Erreur si strictNullChecks

let t: string | null = null; // OK
if (t !== null) {
  t.toUpperCase(); // narrowing
}
```

## Exemple

Inclus dans `strict`. C’est l’un des flags les plus impactants.

## Comment ça fonctionne

Les valeurs potentiellement absentes doivent être modélisées explicitement (`T | null`) et réduites par narrowing.

## Erreurs fréquentes

- Non-null assertion `!` partout pour contourner
- Oublier de gérer null dans les APIs

## À retenir

- null/undefined explicites
- Narrowing obligatoire
- Pilier de strict

## Exercices

1. Type une variable qui peut être string ou null, puis narrow.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   let name: string | null = null;
   if (name !== null) console.log(name.toUpperCase());
   ```
   :::

## Questions d'entretien

1. Quel est l’effet principal de `strictNullChecks` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Empêcher d’assigner null/undefined à des types qui ne les incluent pas, ce qui force à modéliser l’absence et à faire du narrowing avant usage.
   :::
