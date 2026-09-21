---
id: typescript-19-deeppartial
title: DeepPartial
slug: deeppartial
technology: typescript
level: advanced
module: 19-mapped-types
order: 8
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-19-deep-mapped-types]
skills: [mapped-types]
tags: [typescript, mapped-types]
---

## Objectifs

- Implémenter `DeepPartial<T>`
- L’utiliser pour des updates imbriqués
- Gérer tableaux et objets

## Introduction

`DeepPartial` rend optionnelles les propriétés à tous les niveaux.

## Concept

```ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

type Config = {
  server: { host: string; port: number };
  debug: boolean;
};
type ConfigPatch = DeepPartial<Config>;
// { server?: { host?: string; port?: number }; debug?: boolean }
```

## Exemple

Utile pour les patches de configuration imbriquée.

## Comment ça fonctionne

Chaque niveau ajoute `?` et, si la valeur est un objet, on récursive.

## Erreurs fréquentes

- Ne pas traiter les tableaux (souvent on les laisse ou on mappe les éléments)

## À retenir

- DeepPartial = Partial récursif
- Patches / formulaires imbriqués
- Affiner pour arrays si besoin

## Exercices

1. Écris DeepPartial et applique-le à `{ a: { b: number } }`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type DeepPartial<T> = {
     [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
   };
   type T = DeepPartial<{ a: { b: number } }>;
   ```
   :::

## Questions d'entretien

1. Quelle différence entre Partial et DeepPartial ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Partial ne rend optionnel que le premier niveau. DeepPartial applique l’optionalité récursivement aux objets imbriqués.
   :::
