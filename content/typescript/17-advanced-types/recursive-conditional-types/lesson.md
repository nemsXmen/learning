---
id: typescript-17-recursive-conditional-types
title: Recursive conditional types
slug: recursive-conditional-types
technology: typescript
level: advanced
module: 17-advanced-types
order: 8
estimatedMinutes: 15
difficulty: 3
xp: 60
prerequisites: [typescript-17-template-literal-types]
skills: [advanced-types]
tags: [typescript, conditional-types, recursive]
---

## Objectifs

- Écrire des conditional types récursifs
- Voir des exemples (DeepReadonly, Flatten)
- Connaître les limites de profondeur

## Introduction

Les conditional types peuvent se référencer eux-mêmes pour traiter des structures imbriquées.

## Concept

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
```

## Exemple

```ts
type Nested = { a: { b: { c: number } } };
type ReadonlyNested = DeepReadonly<Nested>;
```

## Comment ça fonctionne

La récursion s’arrête grâce à la branche « else » du conditional. TypeScript limite la profondeur d’instanciation pour éviter les boucles infinies.

## Erreurs fréquentes

- Récursion sans cas de base
- Types trop profonds → « excessively deep »

## À retenir

- Conditional récursif = structures imbriquées
- Toujours un cas de terminaison
- Attention à la complexité

## Exercices

1. Esquisse un `DeepPartial<T>` récursif.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type DeepPartial<T> = {
     [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
   };
   ```
   :::

## Questions d'entretien

1. Quand utilise-t-on des conditional types récursifs ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour transformer des structures imbriquées (DeepReadonly, DeepPartial, aplatissement de tableaux imbriqués, etc.). Il faut un cas de base pour terminer la récursion et éviter les erreurs de profondeur.
   :::
