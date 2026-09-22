---
id: typescript-18-creer-ses-propres-utility-types
title: Créer ses propres utility types
slug: creer-ses-propres-utility-types
technology: typescript
level: advanced
module: 18-utility-types
order: 16
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-18-thistype]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Créer des utility types custom
- Composer mapped / conditional types
- Nommer clairement les helpers métier

## Introduction

Au-delà des utilitaires standards, on crée souvent des helpers adaptés au domaine.

## Concept

```ts
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Maybe<T> = T | null | undefined;

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type ValueOf<T> = T[keyof T];
```

## Exemple

```ts
type PropsOfComponent<T> = T extends React.ComponentType<infer P> ? P : never;
```

## Comment ça fonctionne

On combine les outils vus (keyof, mapped, conditional, infer) et on **nomme** le résultat pour la réutilisation.

## Erreurs fréquentes

- Helpers trop génériques et obscurs
- Réinventer un utilitaire standard

## À retenir

- Partir d’un besoin réel
- Nommer clairement
- Documenter les edge cases

## Exercices

1. Crée un utility `KeysOfType<T, U>` qui garde les clés de T dont la valeur extends U.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type KeysOfType<T, U> = {
     [K in keyof T]-?: T[K] extends U ? K : never;
   }[keyof T];
   ```
   :::

## Questions d'entretien

1. Comment abordes-tu la création d’un utility type custom ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Je pars d’un besoin récurrent, je vérifie qu’un utilitaire standard ne suffit pas, j’implémente avec mapped/conditional types, je nomme clairement, et je documente les cas limites pour l’équipe.
   :::
