---
id: typescript-23-fonctions-declarees
title: Fonctions déclarées
slug: fonctions-declarees
technology: typescript
level: intermediate
module: 23-declaration-files
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-23-declarations-de-modules]
skills: [declaration-files]
tags: [typescript, declaration-files]
---

## Objectifs

- Déclarer des signatures de fonctions
- Gérer overloads dans les .d.ts
- Typer des callbacks

## Introduction

Les fonctions sont souvent le cœur des déclarations de libs.

## Concept

```ts
declare function readFile(
  path: string,
  encoding: string,
  callback: (err: Error | null, data: string) => void
): void;

// Overloads
declare function parse(input: string): object;
declare function parse(input: string, reviver: (k: string, v: any) => any): object;
```

## Exemple

```ts
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void;
```

## Comment ça fonctionne

On publie uniquement les signatures. Les overloads documentent les variantes acceptées.

## Erreurs fréquentes

- Overloads mal ordonnés (trop généraux en premier)
- Callbacks typés en Function / any

## À retenir

- Signatures claires + overloads si besoin
- Callbacks précis
- Generics bienvenus dans les .d.ts

## Exercices

1. Déclare une fonction `identity<T>(value: T): T`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   declare function identity<T>(value: T): T;
   ```
   :::

## Questions d'entretien

1. Comment gères-tu les overloads dans un fichier de déclaration ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En listant les signatures d’overload de la plus spécifique à la plus générale, puis éventuellement une signature d’implémentation. Dans un .d.ts, seules les signatures publiques sont nécessaires.
   :::
